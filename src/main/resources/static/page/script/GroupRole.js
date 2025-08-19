// JWT解析和驗證功能
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return atob(str);
}

// Token檢查函數
(function checkTokenOnPageLoad() {

    // 從URL解析參數
    const urlParams = new URLSearchParams(window.location.search);
    let type = urlParams.get('type');
    let token = urlParams.get('token');
    if (!type || !token) {
        alert("缺少必要參數，請檢查連結");
        return;
    }

    // 驗證token格式
    if (!token || token.split('.').length !== 3) {
        alert("尚未登入或 Token 格式錯誤，請重新登入。");
        return;
    }

    try {
        const payloadBase64Url = token.split('.')[1];
        const payloadJson = base64UrlDecode(payloadBase64Url);
        const payload = JSON.parse(payloadJson);

        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            alert("登入已過期，請重新登入。");
            return;
        }

        console.log("Token 驗證通過，可正常使用網頁功能");
        console.log("用戶角色:", type);
        console.log("Token有效期至:", new Date(payload.exp * 1000));

        // 儲存token和type到全局變量
        window.userType = type;
        window.userToken = token;

        // 初始化頁面
        initializePage();

    } catch (e) {
        console.error("無法解析 JWT:", e);
        alert("Token 格式解析失敗，請重新登入。");
    }
})();

// 權限對應表
const roleMap = {
    0: "無權限",
    1: "管理員",
    2: "客戶",
    3: "業務",
    4: "生產單位"
};

// 全局變量
let originalData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = 'none';
let changedRows = new Set();

// DOM 元素
const searchGroupName = document.getElementById('searchGroupName');
const searchDescription = document.getElementById('searchDescription');
const searchRole = document.getElementById('searchRole');
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const sortTriangle = document.getElementById('sortTriangle');
const tableBody = document.getElementById('tableBody');
const groupTable = document.getElementById('groupTable');
const loadingRow = document.getElementById('loadingRow');
const pagination = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');
const pageInfo = document.getElementById('pageInfo');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');

// 初始化頁面
function initializePage() {
    loadDataFromAPI();
}

// 設置事件監聽器
function setupEventListeners() {
    // 篩選按鈕
    filterBtn.addEventListener('click', filterData);
    resetBtn.addEventListener('click', resetFilters);

    // 搜索框Enter鍵觸發
    [searchGroupName, searchDescription].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterData();
            }
        });
    });

    searchRole.addEventListener('change', filterData);

    // 每頁顯示數量
    itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        renderTable();
        updatePagination();
    });

    // 排序三角形按鈕
    sortTriangle.addEventListener('click', function() {
        if (currentSort === 'none' || currentSort === 'desc') {
            sortData('asc');
            updateSortTriangle('asc');
        } else {
            sortData('desc');
            updateSortTriangle('desc');
        }
    });

    // 分頁按鈕
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            updatePagination();
        }
    });

    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            updatePagination();
        }
    });
}

// 從API載入數據
async function loadDataFromAPI() {
    if (!window.userType || !window.userToken) {
        console.error("User type 或 token 未設定，無法載入資料");
        return;
    }

    const encodedToken = encodeURIComponent(window.userToken);
    const apiUrl = `${window.location.protocol}//${window.location.host}/Admin/token/${window.userType}/${encodedToken}`;

    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        console.log("成功取得資料:", data);
        originalData = Array.isArray(data) ? data : [];
        filteredData = [...originalData];

        if (loadingRow) {
            loadingRow.remove();
        }

        renderTable();
        updatePagination();

    } catch (err) {
        console.error("API 錯誤", err);
        if (loadingRow) {
            loadingRow.innerHTML = `
                <td colspan="3" class="error-message">
                    無法載入資料：${err.message}<br>
                    請檢查網路連線或聯絡系統管理員
                </td>
            `;
        }
    }
}

// 防抖函數
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 安全處理null值
function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '' : value;
}

// 過濾數據
function filterData() {
    const groupNameFilter = searchGroupName.value.toLowerCase();
    const descriptionFilter = searchDescription.value.toLowerCase();
    const roleFilter = searchRole.value;

    filteredData = originalData.filter(item => {
        const groupNameMatch = safeValue(item.GroupName).toLowerCase().includes(groupNameFilter);
        const descriptionMatch = safeValue(item.Description).toLowerCase().includes(descriptionFilter);
        const roleMatch = roleFilter === '' || item.RoleID.toString() === roleFilter;

        return groupNameMatch && descriptionMatch && roleMatch;
    });

    currentPage = 1;
    renderTable();
    updatePagination();
}

// 重設篩選條件
function resetFilters() {
    searchGroupName.value = '';
    searchDescription.value = '';
    searchRole.value = '';

    filteredData = [...originalData];
    updateSortTriangle('none');
    currentSort = 'none';
    currentPage = 1;

    renderTable();
    updatePagination();
}

// 排序數據
function sortData(order) {
    if (order === 'asc') {
        filteredData.sort((a, b) => a.RoleID - b.RoleID);
        currentSort = 'asc';
    } else if (order === 'desc') {
        filteredData.sort((a, b) => b.RoleID - a.RoleID);
        currentSort = 'desc';
    }

    currentPage = 1;
    renderTable();
    updatePagination();
}

// 更新排序三角形狀態
function updateSortTriangle(activeSort) {
    if (activeSort === 'asc') {
        sortTriangle.className = 'sort-triangle up';
        currentSort = 'asc';
    } else if (activeSort === 'desc') {
        sortTriangle.className = 'sort-triangle down';
        currentSort = 'desc';
    } else {
        sortTriangle.className = 'sort-triangle up';
        currentSort = 'none';
    }
}

// 渲染表格
function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = filteredData.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    if (currentPageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="no-data">沒有找到匹配的數據</td></tr>';
        return;
    }

    currentPageData.forEach(item => {
        const row = createTableRow(item);
        tableBody.appendChild(row);
    });
}

// 創建表格行
function createTableRow(item) {
    const row = document.createElement('tr');
    row.setAttribute('data-group-id', item.GroupID);

    // 群組名稱 (只顯示，不可編輯)
    const groupNameCell = document.createElement('td');
    groupNameCell.textContent = safeValue(item.GroupName);
    row.appendChild(groupNameCell);

    // 其他描述 (可編輯)
    const descriptionCell = document.createElement('td');
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.value = safeValue(item.Description);
    descriptionInput.className = 'editable';
    descriptionInput.setAttribute('data-original', safeValue(item.Description));
    descriptionInput.addEventListener('input', function() {
        handleCellChange(this, item.GroupID, 'Description', this.value);
    });
    descriptionCell.appendChild(descriptionInput);
    row.appendChild(descriptionCell);

    // 權限 (可編輯下拉選單)
    const roleCell = document.createElement('td');
    const roleSelect = document.createElement('select');
    roleSelect.className = 'role-select';
    roleSelect.setAttribute('data-original', item.RoleID.toString());

    // 添加選項
    for (let i = 0; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} - ${roleMap[i]}`;
        if (i === item.RoleID) {
            option.selected = true;
        }
        roleSelect.appendChild(option);
    }

    roleSelect.addEventListener('change', function() {
        handleCellChange(this, item.GroupID, 'RoleID', parseInt(this.value));
    });

    roleCell.appendChild(roleSelect);
    row.appendChild(roleCell);

    return row;
}

// 處理單元格變更
function handleCellChange(element, groupId, field, newValue) {
    const originalValue = element.getAttribute('data-original');
    const isChanged = originalValue !== newValue.toString();

    // 更新數據
    const itemIndex = originalData.findIndex(item => item.GroupID === groupId);
    if (itemIndex !== -1) {
        originalData[itemIndex][field] = newValue;

        // 同時更新filteredData中的對應項目
        const filteredIndex = filteredData.findIndex(item => item.GroupID === groupId);
        if (filteredIndex !== -1) {
            filteredData[filteredIndex][field] = newValue;
        }
    }

    // 標記變更狀態
    if (isChanged) {
        element.classList.add('changed');
        changedRows.add(groupId);
    } else {
        element.classList.remove('changed');

        // 檢查該行是否還有其他變更
        const row = element.closest('tr');
        const hasOtherChanges = row.querySelectorAll('.changed').length > 1 ||
            (row.querySelectorAll('.changed').length === 1 && !element.classList.contains('changed'));

        if (!hasOtherChanges) {
            changedRows.delete(groupId);
        }
    }

    console.log('數據變更:', {
        groupId,
        field,
        newValue,
        originalValue,
        isChanged,
        changedRows: Array.from(changedRows)
    });
}

// 更新分頁
function updatePagination() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // 更新上一頁/下一頁按鈕
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    // 更新頁碼按鈕
    pageNumbers.innerHTML = '';

    if (totalPages <= 7) {
        // 如果總頁數<=7，顯示所有頁碼
        for (let i = 1; i <= totalPages; i++) {
            createPageButton(i);
        }
    } else {
        // 複雜的分頁邏輯
        if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) {
                createPageButton(i);
            }
            createEllipsis();
            createPageButton(totalPages);
        } else if (currentPage >= totalPages - 3) {
            createPageButton(1);
            createEllipsis();
            for (let i = totalPages - 4; i <= totalPages; i++) {
                createPageButton(i);
            }
        } else {
            createPageButton(1);
            createEllipsis();
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                createPageButton(i);
            }
            createEllipsis();
            createPageButton(totalPages);
        }
    }

    // 更新頁面資訊
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    pageInfo.textContent = `顯示 ${startItem}-${endItem} 項，共 ${totalItems} 項`;
}

// 創建頁碼按鈕
function createPageButton(pageNum) {
    const button = document.createElement('button');
    button.textContent = pageNum;
    button.addEventListener('click', function() {
        currentPage = pageNum;
        renderTable();
        updatePagination();
    });

    if (pageNum === currentPage) {
        button.classList.add('active');
    }

    pageNumbers.appendChild(button);
}

// 創建省略號
function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.style.padding = '8px 12px';
    ellipsis.style.color = '#666';
    pageNumbers.appendChild(ellipsis);
}

// 獲取變更的數據 (供後端API調用)
function getChangedData() {
    const changedData = originalData.filter(item => changedRows.has(item.GroupID));
    return changedData.map(item => ({
        groupId: item.GroupID,
        groupName: item.GroupName,
        description: item.Description,
        roleId: item.RoleID
    }));
}

// 將函數暴露到全局作用域，供外部調用
window.getChangedData = getChangedData;
window.resetFilters = resetFilters;


window.addEventListener('DOMContentLoaded', () => {
    // 抓取 DOM 元素
    const filterBtn = document.getElementById('filterBtn');
    const resetBtn = document.getElementById('resetBtn');
    const searchGroupName = document.getElementById('searchGroupName');
    const searchDescription = document.getElementById('searchDescription');
    const searchRole = document.getElementById('searchRole');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const sortTriangle = document.getElementById('sortTriangle');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    // 綁定事件
    filterBtn.addEventListener('click', filterData);
    resetBtn.addEventListener('click', resetFilters);

    [searchGroupName, searchDescription].forEach(input => {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                filterData();
            }
        });
    });

    searchRole.addEventListener('change', filterData);

    itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        renderTable();
        updatePagination();
    });

    sortTriangle.addEventListener('click', () => {
        if (currentSort === 'none' || currentSort === 'desc') {
            sortData('asc');
            updateSortTriangle('asc');
        } else {
            sortData('desc');
            updateSortTriangle('desc');
        }
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            updatePagination();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            updatePagination();
        }
    });

    // 初始化頁面
    initializePage();
});
