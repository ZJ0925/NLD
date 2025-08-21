// GroupRole.js - 群組管理系統（徹底修正取消變更問題）

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
window.addEventListener('DOMContentLoaded', () => {
    // 綁定事件
    filterBtn.addEventListener('click', applyFilters);
    resetBtn.addEventListener('click', resetFilters);

    [searchGroupName].forEach(input => {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilters();
            }
        });
    });

    searchRole.addEventListener('change', applyFilters);

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
    const urlParams = new URLSearchParams(window.location.search);
    let type = urlParams.get('type');
    let token = urlParams.get('token');

    if (!type || !token) {
        alert("缺少必要參數，請檢查連結");
        return;
    }

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

        window.userType = type;
        window.userToken = token;

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

        // 初始化時重建 filteredData
        rebuildFilteredData();

        if (loadingRow) {
            loadingRow.remove();
        }

        renderTable();
        updatePagination();

    } catch (err) {
        console.error("API 錯誤", err);
        if (loadingRow) {
            loadingRow.innerHTML = `
                <td colspan="2" class="error-message">
                    無法載入資料：${err.message}<br>
                    請檢查網路連線或聯絡系統管理員
                </td>
            `;
        }
    }
}

// 4. 重建篩選數據 - 核心修正函數
function rebuildFilteredData() {
    const groupNameFilter = searchGroupName.value.toLowerCase();
    const roleFilter = searchRole.value;

    // 完全基於原始數據重建，然後應用變更
    filteredData = originalData
        .filter(item => {
            const groupNameMatch = safeValue(item.GroupName).toLowerCase().includes(groupNameFilter);
            const roleMatch = roleFilter === '' || item.RoleID.toString() === roleFilter;
            return groupNameMatch && roleMatch;
        })
        .map(item => {
            // 深度複製原始項目
            const itemCopy = JSON.parse(JSON.stringify(item));

            // 如果有變更記錄，則應用變更
            if (currentChanges.has(item.GroupID)) {
                const changes = currentChanges.get(item.GroupID);
                Object.assign(itemCopy, changes);
            }

            return itemCopy;
        });
}

// 5. 應用篩選條件
function applyFilters() {
    rebuildFilteredData();
    currentPage = 1;
    renderTable();
    updatePagination();
}

// 6. 重設篩選條件
function resetFilters() {
    searchGroupName.value = '';
    searchRole.value = '';
    rebuildFilteredData();
    updateSortTriangle('none');
    currentSort = 'none';
    currentPage = 1;
    renderTable();
    updatePagination();
}

// 7. 排序數據
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

// 8. 分頁控制
function updatePagination() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    pageNumbers.innerHTML = '';

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            createPageButton(i);
        }
    } else {
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

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    pageInfo.textContent = `顯示 ${startItem}-${endItem} 項，共 ${totalItems} 項`;
}

// 9. 渲染表格
function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = filteredData.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    if (currentPageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="2" class="no-data">沒有找到匹配的數據</td></tr>';
        return;
    }

    currentPageData.forEach(item => {
        const row = createTableRow(item);
        tableBody.appendChild(row);
    });
}

// 10. 更新排序三角形
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

// 11. 變更處理 - 修正版本，不直接修改 filteredData
function handleCellChange(element, groupId, field, newValue) {
    console.log('=== handleCellChange 開始 ===');
    console.log('參數:', { groupId, field, newValue });

    const originalItem = originalData.find(item => item.GroupID === groupId);
    if (!originalItem) {
        console.error('找不到原始數據項目:', groupId);
        return;
    }

    // 獲取原始值
    let originalValue = originalItem[field];
    let compareValue = newValue;

    if (field === 'RoleID') {
        originalValue = parseInt(originalValue);
        compareValue = parseInt(newValue);
    }

    // 判斷是否與原始值不同
    const isChanged = originalValue !== compareValue;

    console.log('比較結果:', {
        isChanged,
        originalValue,
        compareValue
    });

    if (isChanged) {
        // 有變更：加入紅色樣式和記錄變更
        element.classList.add('changed');

        if (!currentChanges.has(groupId)) {
            currentChanges.set(groupId, {});
        }
        currentChanges.get(groupId)[field] = compareValue;
        changedRows.add(groupId);

    } else {
        // 沒有變更：移除紅色樣式和變更記錄
        element.classList.remove('changed');

        // 從變更記錄中移除此欄位
        if (currentChanges.has(groupId)) {
            const changes = currentChanges.get(groupId);
            delete changes[field];

            // 如果該群組沒有其他變更，完全移除
            if (Object.keys(changes).length === 0) {
                currentChanges.delete(groupId);
                changedRows.delete(groupId);
            }
        }
    }

    // 重建 filteredData 以反映變更
    rebuildFilteredData();

    // 重新渲染當前頁面
    renderTable();

    console.log('當前狀態:', {
        changedRowsSize: changedRows.size,
        currentChangesSize: currentChanges.size,
        elementHasChangedClass: element.classList.contains('changed')
    });

    updateSaveButtonVisibility();
}

// 12. 更新儲存按鈕顯示
function updateSaveButtonVisibility() {
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelChangesBtn = document.getElementById('cancelChangesBtn');

    const hasChanges = changedRows.size > 0;

    if (hasChanges) {
        if (saveChangesBtn) saveChangesBtn.style.display = 'inline-block';
        if (cancelChangesBtn) cancelChangesBtn.style.display = 'inline-block';
    } else {
        if (saveChangesBtn) saveChangesBtn.style.display = 'none';
        if (cancelChangesBtn) cancelChangesBtn.style.display = 'none';
    }
}

// 13. 儲存變更
async function saveChanges() {
    const changedData = getChangedData();

    if (changedData.length === 0) {
        alert('沒有資料需要儲存');
        return;
    }

    if (!confirm(`確定要儲存 ${changedData.length} 筆變更嗎？`)) {
        return;
    }

    try {
        const encodedToken = encodeURIComponent(window.userToken);
        const response = await fetch(`${window.location.protocol}//${window.location.host}/Admin/updateGroups/${window.userType}/${encodedToken}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changedData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('儲存成功回應:', result);

        alert('變更已成功儲存');

        // 儲存成功後，將變更應用到原始數據
        currentChanges.forEach((changes, groupId) => {
            const originalIndex = originalData.findIndex(item => item.GroupID === groupId);
            if (originalIndex !== -1) {
                originalData[originalIndex] = { ...originalData[originalIndex], ...changes };
            }
        });

        // 清除變更標記
        changedRows.clear();
        currentChanges.clear();

        // 重建數據並重新渲染
        rebuildFilteredData();
        renderTable();
        updateSaveButtonVisibility();

    } catch (error) {
        console.error('儲存失敗:', error);
        alert('儲存失敗: ' + error.message);
    }
}

// 14. 取消變更 - 徹底修正版本
function cancelChanges() {
    if (!confirm('確定要取消所有變更嗎？')) {
        return;
    }

    console.log('開始取消變更...');
    console.log('取消前 - changedRows:', changedRows.size, 'currentChanges:', currentChanges.size);

    // 清除所有變更記錄
    changedRows.clear();
    currentChanges.clear();

    // 移除所有變更樣式
    document.querySelectorAll('.changed').forEach(el => {
        el.classList.remove('changed');
    });

    // 重建 filteredData（此時 currentChanges 已清空，所以會還原到原始狀態）
    rebuildFilteredData();

    // 重新渲染
    renderTable();
    updateSaveButtonVisibility();

    console.log('取消後 - changedRows:', changedRows.size, 'currentChanges:', currentChanges.size);
    console.log('已取消所有變更，數據已還原到原始狀態');
}

// 15. 獲取變更數據
function getChangedData() {
    const changedData = [];

    currentChanges.forEach((changes, groupId) => {
        const originalItem = originalData.find(item => item.GroupID === groupId);
        if (originalItem) {
            changedData.push({
                GroupID: groupId,
                GroupName: originalItem.GroupName,
                RoleID: changes.RoleID !== undefined ? changes.RoleID : originalItem.RoleID
            });
        }
    });

    return changedData;
}

// 16. 創建表格行
function createTableRow(item) {
    const row = document.createElement('tr');
    row.setAttribute('data-group-id', item.GroupID);

    // 找到對應的原始數據
    const originalItem = originalData.find(orig => orig.GroupID === item.GroupID);

    // 群組名稱
    const groupNameCell = document.createElement('td');
    groupNameCell.textContent = safeValue(item.GroupName);
    row.appendChild(groupNameCell);

    // 權限選單
    const roleCell = document.createElement('td');
    const roleSelect = document.createElement('select');
    roleSelect.className = 'role-select';

    // 檢查權限是否已變更
    if (originalItem) {
        const originalRole = parseInt(originalItem.RoleID);
        const currentRole = parseInt(item.RoleID);
        if (originalRole !== currentRole) {
            roleSelect.classList.add('changed');
        }
    }

    // 添加選項
    for (let i = 0; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} - ${roleMap[i]}`;
        if (i === parseInt(item.RoleID)) {
            option.selected = true;
        }
        roleSelect.appendChild(option);
    }

    roleSelect.addEventListener('change', function(e) {
        const newRoleId = parseInt(e.target.value);
        handleCellChange(e.target, item.GroupID, 'RoleID', newRoleId);
    });

    roleCell.appendChild(roleSelect);
    row.appendChild(roleCell);

    return row;
}

// 17. 創建頁碼按鈕
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

// 18. 創建省略號
function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.style.padding = '8px 12px';
    ellipsis.style.color = '#666';
    pageNumbers.appendChild(ellipsis);
}

// 19. 初始化頁面
function initializePage() {
    loadDataFromAPI();
}

// 20. JWT解析功能
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return atob(str);
}

// 21. 安全處理null值
function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '' : value;
}

// 將函數暴露到全局作用域，供外部調用
window.getChangedData = getChangedData;
window.resetFilters = resetFilters;
window.saveChanges = saveChanges;
window.cancelChanges = cancelChanges;