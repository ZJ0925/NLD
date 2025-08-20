// GroupRole.js - 群組管理系統（清理版）

// 全局變數
let originalData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = 'none';
let changedRows = new Set();
let currentChanges = new Map(); // 儲存當前的變更數據

// DOM 元素
const searchGroupName = document.getElementById('searchGroupName');
const searchDescription = document.getElementById('searchDescription');
const searchRole = document.getElementById('searchRole');
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const sortTriangle = document.getElementById('sortTriangle');
const tableBody = document.getElementById('tableBody');
const loadingRow = document.getElementById('loadingRow');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');
const pageInfo = document.getElementById('pageInfo');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');

// 權限對應表
const roleMap = {
    0: "無權限",
    1: "管理員",
    2: "客戶",
    3: "業務",
    4: "生產單位"
};

// 1. 頁面加載初始化
// 頁面加載初始化
window.addEventListener('DOMContentLoaded', () => {
    // 綁定事件
    filterBtn.addEventListener('click', filterData);
    resetBtn.addEventListener('click', resetFilters);

    [searchGroupName, searchDescription].forEach(input => {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault(); // 防止 Enter 鍵提交表單或觸發其他不必要的事件
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

    // 綁定儲存和取消按鈕事件
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelChangesBtn = document.getElementById('cancelChangesBtn');

    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', saveChanges);
    }

    if (cancelChangesBtn) {
        cancelChangesBtn.addEventListener('click', cancelChanges);
    }

    // 初始化頁面
    initializePage();
});


// 2. Token檢查與解析
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

// 3. 從 API 載入數據
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

// 4. 篩選數據
function filterData() {
    const groupNameFilter = searchGroupName.value.toLowerCase();
    const descriptionFilter = searchDescription.value.toLowerCase();
    const roleFilter = searchRole.value;

    // 應用篩選時，使用原始數據進行篩選，然後應用變更
    filteredData = originalData.filter(item => {
        const groupNameMatch = safeValue(item.GroupName).toLowerCase().includes(groupNameFilter);
        const descriptionMatch = safeValue(item.Description).toLowerCase().includes(descriptionFilter);
        const roleMatch = roleFilter === '' || item.RoleID.toString() === roleFilter;

        return groupNameMatch && descriptionMatch && roleMatch;
    }).map(item => {
        // 如果有變更，應用變更
        if (currentChanges.has(item.GroupID)) {
            return { ...item, ...currentChanges.get(item.GroupID) };
        }
        return { ...item };
    });

    currentPage = 1;
    renderTable();
    updatePagination();
}

// 5. 重設篩選條件
function resetFilters() {
    searchGroupName.value = '';
    searchDescription.value = '';
    searchRole.value = '';

    // 重設時保持變更狀態
    filteredData = originalData.map(item => {
        if (currentChanges.has(item.GroupID)) {
            return { ...item, ...currentChanges.get(item.GroupID) };
        }
        return { ...item };
    });

    updateSortTriangle('none');
    currentSort = 'none';
    currentPage = 1;

    renderTable();
    updatePagination();
}

// 6. 排序數據
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

// 7. 分頁控制
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

// 8. 渲染表格
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

// 9. 更新排序三角形
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


// 10. 變更處理
function handleCellChange(element, groupId, field, newValue) {
    const originalItem = originalData.find(item => item.GroupID === groupId);
    if (!originalItem) return;

    const originalValue = originalItem[field];
    const isChanged = originalValue?.toString() !== newValue?.toString();

    console.log('變更檢查:', {
        groupId,
        field,
        originalValue,
        newValue,
        isChanged,
        changedRows: Array.from(changedRows) // 這裡可以檢查 `changedRows`
    });


    if (isChanged) {
        // 儲存變更到 currentChanges
        if (!currentChanges.has(groupId)) {
            currentChanges.set(groupId, {});
        }
        currentChanges.get(groupId)[field] = newValue;

        // 更新 filteredData 中的對應項目
        const filteredIndex = filteredData.findIndex(item => item.GroupID === groupId);
        if (filteredIndex !== -1) {
            filteredData[filteredIndex][field] = newValue;
        }

        element.classList.add('changed');
        changedRows.add(groupId); // 確保變更後加到 `changedRows` 中
    } else {
        // 如果值恢復為原始值，移除變更
        if (currentChanges.has(groupId)) {
            delete currentChanges.get(groupId)[field];

            // 如果該項目沒有其他變更，完全移除
            const changes = currentChanges.get(groupId);
            if (Object.keys(changes).length === 0) {
                currentChanges.delete(groupId);
                changedRows.delete(groupId); // 移除變更
            }
        }

        element.classList.remove('changed');

        // 檢查該行是否還有其他變更
        const row = element.closest('tr');
        const hasOtherChanges = row.querySelectorAll('.changed').length > 0;

        if (!hasOtherChanges) {
            changedRows.delete(groupId);
        }
    }

    // 更新儲存按鈕顯示
    updateSaveButton();
}

// 11. 更新儲存按鈕顯示
function updateSaveButton() {
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelChangesBtn = document.getElementById('cancelChangesBtn');

    // 檢查是否有變更
    if (changedRows.size > 0) {
        if (saveChangesBtn) saveChangesBtn.style.display = 'block'; // 顯示儲存按鈕
        if (cancelChangesBtn) cancelChangesBtn.style.display = 'block'; // 顯示取消按鈕
    } else {
        if (saveChangesBtn) saveChangesBtn.style.display = 'none'; // 隱藏儲存按鈕
        if (cancelChangesBtn) cancelChangesBtn.style.display = 'none'; // 隱藏取消按鈕
    }
}


// 12. 儲存變更
async function saveChanges() {
    const changedData = getChangedData();

    if (changedData.length === 0) {
        alert('沒有資料需要儲存');
        return;
    }

    console.log('準備儲存的數據:', changedData);

    try {
        // TODO: 發送到後端進行保存（API請求）
        // const response = await fetch('/api/groups/update', {
        //     method: 'PUT',
        //     headers: {
        //         'Authorization': `Bearer ${window.userToken}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(changedData)
        // });

        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }

        // 模擬成功保存
        alert('變更已成功儲存');

        // 儲存成功後，將變更應用到原始數據並清除變更標記
        currentChanges.forEach((changes, groupId) => {
            const originalIndex = originalData.findIndex(item => item.GroupID === groupId);
            if (originalIndex !== -1) {
                originalData[originalIndex] = { ...originalData[originalIndex], ...changes };
            }
        });

        // 清除變更標記
        changedRows.clear();
        currentChanges.clear();

        document.querySelectorAll('.changed').forEach(el => {
            el.classList.remove('changed');
        });

        updateSaveButton();

    } catch (error) {
        console.error('儲存失敗:', error);
        alert('儲存失敗: ' + error.message);
    }
}

// 13. 取消變更
function cancelChanges() {
    if (!confirm('確定要取消所有變更嗎？')) {
        return;
    }

    // 清除所有變更
    changedRows.clear();
    currentChanges.clear();

    // 移除所有變更樣式
    document.querySelectorAll('.changed').forEach(el => {
        el.classList.remove('changed');
    });

    // 重新應用當前篩選條件（使用原始數據）
    filterData();

    updateSaveButton();
    console.log('已取消所有變更');
}

// 14. 獲取變更數據
function getChangedData() {
    const changedData = [];

    currentChanges.forEach((changes, groupId) => {
        const originalItem = originalData.find(item => item.GroupID === groupId);
        if (originalItem) {
            changedData.push({
                GroupID: groupId,
                GroupName: originalItem.GroupName,
                Description: changes.Description !== undefined ? changes.Description : originalItem.Description,
                RoleID: changes.RoleID !== undefined ? changes.RoleID : originalItem.RoleID
            });
        }
    });

    return changedData;
}

// 15. 創建表格行
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

    // 檢查是否有變更並標記
    const originalItem = originalData.find(orig => orig.GroupID === item.GroupID);
    if (originalItem && originalItem.Description !== item.Description) {
        descriptionInput.classList.add('changed');
    }

    descriptionInput.addEventListener('input', function() {
        handleCellChange(this, item.GroupID, 'Description', this.value);
    });
    descriptionInput.addEventListener('blur', function() {
        handleCellChange(this, item.GroupID, 'Description', this.value);
    });
    descriptionCell.appendChild(descriptionInput);
    row.appendChild(descriptionCell);

    // 權限 (可編輯下拉選單)
    const roleCell = document.createElement('td');
    const roleSelect = document.createElement('select');
    roleSelect.className = 'role-select';

    // 檢查是否有變更並標記
    if (originalItem && originalItem.RoleID !== item.RoleID) {
        roleSelect.classList.add('changed');
    }

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

// 16. 創建頁碼按鈕
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

// 17. 創建省略號
function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.style.padding = '8px 12px';
    ellipsis.style.color = '#666';
    pageNumbers.appendChild(ellipsis);
}

// 18. 初始化頁面
function initializePage() {
    loadDataFromAPI();
}

// 19. JWT解析功能
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return atob(str);
}

// 20. 安全處理null值
function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '' : value;
}

// 將函數暴露到全局作用域，供外部調用
window.getChangedData = getChangedData;
window.resetFilters = resetFilters;
window.saveChanges = saveChanges;
window.cancelChanges = cancelChanges;