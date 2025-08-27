// GroupRole.js - 群組管理系統（已移除token驗證）

// 全域變數
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

// 1. 頁面載入初始化
window.addEventListener('DOMContentLoaded', () => {
    // 綁定事件
    filterBtn.addEventListener('click', applyFilters);
    resetBtn.addEventListener('click', resetFilters);

    searchGroupName.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    });

    searchRole.addEventListener('change', applyFilters);

    itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        renderTable();
        updatePagination();
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

    // 綁定展開/收合全部按鈕
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');

    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', expandAll);
    }

    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', collapseAll);
    }

    // 初始化頁面
    initializePage();
});

// 2. 從 API 載入數據
async function loadDataFromAPI() {
    const apiUrl = `${window.location.protocol}//${window.location.host}/Role/Admin`;

    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        console.log("成功取得資料:", data);
        originalData = Array.isArray(data) ? data : [];

        // 初始化時重建 filteredData
        rebuildFilteredData();

        // 移除載入中提示
        const loadingContainer = document.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }

        renderTable();
        updatePagination();

    } catch (err) {
        console.error("API 錯誤", err);
        const groupsContainer = document.getElementById('groupsContainer');
        if (groupsContainer) {
            groupsContainer.innerHTML = `
                <div class="error-message">
                    無法載入資料：${err.message}<br>
                    請檢查網路連線或聯絡系統管理員
                </div>
            `;
        }
    }
}

// 3. 重建篩選數據 - 核心修正函數
function rebuildFilteredData() {
    const groupNameFilter = searchGroupName.value.toLowerCase();
    const roleFilter = searchRole.value;

    // 完全基於原始數據重建，然後應用變更
    filteredData = originalData
        .filter(item => {
            const groupNameMatch = safeValue(item.groupName).toLowerCase().includes(groupNameFilter);
            const roleMatch = roleFilter === '' || item.roleID.toString() === roleFilter;
            return groupNameMatch && roleMatch;
        })
        .map(item => {
            // 深度複製原始項目
            const itemCopy = JSON.parse(JSON.stringify(item));

            // 如果有變更記錄，則應用變更
            if (currentChanges.has(item.groupID)) {
                const changes = currentChanges.get(item.groupID);
                Object.assign(itemCopy, changes);
            }

            return itemCopy;
        });
}

// 4. 應用篩選條件
function applyFilters() {
    rebuildFilteredData();
    currentPage = 1;
    renderTable();
    updatePagination();
}

// 5. 重設篩選條件
function resetFilters() {
    searchGroupName.value = '';
    searchRole.value = '';
    rebuildFilteredData();
    currentPage = 1;
    renderTable();
    updatePagination();
}

// 6. 分頁控制
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

// 7. 渲染表格
function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = filteredData.slice(startIndex, endIndex);

    const groupsContainer = document.getElementById('groupsContainer');
    if (!groupsContainer) return;

    if (currentPageData.length === 0) {
        groupsContainer.innerHTML = '<div class="no-data">沒有找到匹配的數據</div>';
        return;
    }

    // 創建群組項目
    let htmlContent = '';
    currentPageData.forEach(item => {
        htmlContent += createGroupItem(item);
    });

    groupsContainer.innerHTML = htmlContent;

    // 為每個群組綁定事件
    currentPageData.forEach(item => {
        bindGroupEvents(item);
    });
}

// 8. 創建群組項目HTML
function createGroupItem(item) {
    const originalItem = originalData.find(orig => orig.groupID === item.groupID);
    let roleSelectClass = 'role-select';

    if (originalItem) {
        const originalRole = parseInt(originalItem.roleID);
        const currentRole = parseInt(item.roleID);
        if (originalRole !== currentRole) {
            roleSelectClass += ' changed';
        }
    }

    let roleOptions = '';
    for (let i = 0; i <= 4; i++) {
        const selected = i === parseInt(item.roleID) ? 'selected' : '';
        roleOptions += `<option value="${i}" ${selected}>${i} - ${roleMap[i]}</option>`;
    }

    // 確保 userName 有值
    const displayUserName = safeValue(item.userName || (originalItem && originalItem.userName) || '');

    return `
        <div class="group-item">
            <div class="group-header" data-group-id="${item.groupID}">
                <div class="group-name">${safeValue(item.groupName)}</div>
                <div class="expand-icon">▼</div>
            </div>
            <div class="group-content">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>群組名稱</th>
                            <th>使用者名稱</th>
                            <th>權限設定</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${safeValue(item.groupName)}</td>
                            <td>${displayUserName}</td>
                            <td>
                                <select class="${roleSelectClass}" data-group-id="${item.groupID}">
                                    ${roleOptions}
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}


// 9. 綁定群組事件
function bindGroupEvents(item) {
    // 綁定展開/收合事件
    const header = document.querySelector(`[data-group-id="${item.groupID}"].group-header`);
    if (header) {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.expand-icon');

            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                this.classList.remove('expanded');
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('expanded');
                this.classList.add('expanded');
                icon.style.transform = 'rotate(180deg)';
            }
        });
    }

    // 綁定權限選單變更事件
    const roleSelect = document.querySelector(`select[data-group-id="${item.groupID}"]`);
    if (roleSelect) {
        roleSelect.addEventListener('change', function(e) {
            const newRoleId = parseInt(e.target.value);
            handleCellChange(e.target, item.groupID, 'roleID', newRoleId);
        });
    }
}

// 10. 展開全部群組
function expandAll() {
    document.querySelectorAll('.group-content').forEach(content => {
        content.classList.add('expanded');
    });
    document.querySelectorAll('.group-header').forEach(header => {
        header.classList.add('expanded');
        const icon = header.querySelector('.expand-icon');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    });
}

// 11. 收合全部群組
function collapseAll() {
    document.querySelectorAll('.group-content').forEach(content => {
        content.classList.remove('expanded');
    });
    document.querySelectorAll('.group-header').forEach(header => {
        header.classList.remove('expanded');
        const icon = header.querySelector('.expand-icon');
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
    });
}

// 12. 變更處理 - 修正版本，不直接修改 filteredData
function handleCellChange(element, groupId, field, newValue) {
    console.log('=== handleCellChange 開始 ===');
    console.log('參數:', { groupId, field, newValue });

    const originalItem = originalData.find(item => item.groupID === groupId);
    if (!originalItem) {
        console.error('找不到原始數據項目:', groupId);
        return;
    }

    // 取得原始值
    let originalValue = originalItem[field];
    let compareValue = newValue;

    if (field === 'roleID') {
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

// 13. 更新儲存按鈕顯示
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

// 14. 儲存變更 - 使用 /Role/update API
async function saveChanges() {
    const changedData = getChangedData();

    // 詳細調試資訊
    console.log('=== 準備儲存變更 ===');
    console.log('changedRows:', Array.from(changedRows));
    console.log('currentChanges:', Array.from(currentChanges.entries()));
    console.log('準備傳送的數據:', JSON.stringify(changedData, null, 2));

    if (changedData.length === 0) {
        alert('沒有資料需要儲存');
        return;
    }

    if (!confirm(`確定要儲存 ${changedData.length} 筆變更嗎？`)) {
        return;
    }

    try {
        const apiUrl = `${window.location.protocol}//${window.location.host}/Role/update`;

        console.log('準備發送請求到:', apiUrl);
        console.log('請求方法: PUT');
        console.log('請求內容:', JSON.stringify(changedData, null, 2));

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(changedData)
        });

        console.log('收到回應狀態:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('錯誤回應內容:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('儲存成功回應:', result);

        alert('變更已成功儲存');

        // 立即將當前頁面上所有紅色框框變成綠色，不重新渲染
        document.querySelectorAll('.changed').forEach(element => {
            element.classList.remove('changed');
            element.classList.add('saved');
        });

        // 儲存成功後，將變更應用到原始數據
        currentChanges.forEach((changes, groupId) => {
            const originalIndex = originalData.findIndex(item => item.groupID === groupId);
            if (originalIndex !== -1) {
                originalData[originalIndex] = { ...originalData[originalIndex], ...changes };
            }
        });

        // 清除變更標記（但不重新渲染，保持綠色效果）
        changedRows.clear();
        currentChanges.clear();
        updateSaveButtonVisibility();

        // 更新 filteredData 以保持數據同步，但不重新渲染表格
        rebuildFilteredData();

        // 3秒後將綠色框框淡化
        setTimeout(() => {
            document.querySelectorAll('.saved').forEach(element => {
                element.classList.add('saved-fadeout');
            });

            // 再過1秒完全移除樣式
            setTimeout(() => {
                document.querySelectorAll('.saved').forEach(element => {
                    element.classList.remove('saved', 'saved-fadeout');
                });
            }, 1000);
        }, 2000);

    } catch (error) {
        console.error('儲存失敗:', error);
        alert('儲存失敗: ' + error.message);
    }
}

// 15. 取消變更 - 徹底修正版本
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

// 16. 取得變更數據 - 根據 Controller 的格式調整
function getChangedData() {
    const changedData = [];

    currentChanges.forEach((changes, groupId) => {
        const originalItem = originalData.find(item => item.groupID === groupId);
        if (originalItem) {
            changedData.push({
                groupID: groupId,
                groupName: originalItem.groupName,
                roleID: changes.roleID !== undefined ? changes.roleID : originalItem.roleID
            });
        }
    });

    return changedData;
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

// 20. 安全處理null值
function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '' : value;
}

// 將函數暴露到全域作用域，供外部調用
window.getChangedData = getChangedData;
window.resetFilters = resetFilters;
window.saveChanges = saveChanges;
window.cancelChanges = cancelChanges;