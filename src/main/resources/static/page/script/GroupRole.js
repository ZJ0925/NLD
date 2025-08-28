// GroupRole.js - 群組管理系統（重構版）

// 全域變數
let originalGroupData = []; // 儲存群組列表的原始資料
let filteredGroupData = []; // 儲存篩選後的群組列表
let originalUserData = []; // 儲存選中群組的使用者原始資料
let filteredUserData = []; // 儲存篩選後的使用者資料
let currentPage = 1;
let itemsPerPage = 10;
let currentView = 'groupList'; // 'groupList' 或 'groupDetail'
let currentGroupId = null;
let changedRows = new Set();
let currentChanges = new Map(); // 儲存當前的變更數據
let currentSort = 'none'; // 'none', 'asc', 'desc'

// DOM 元素
const searchGroupName = document.getElementById('searchGroupName');
const searchUserName = document.getElementById('searchUserName');
const searchRole = document.getElementById('searchRole');
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');
const pageInfo = document.getElementById('pageInfo');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');

// 權限對應表 - 移除無權限選項
const roleMap = {
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

    searchUserName.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    });

    searchRole.addEventListener('change', applyFilters);

    itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        renderCurrentView();
        updatePagination();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentView();
            updatePagination();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = getCurrentTotalPages();
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentView();
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

    // 綁定麵包屑導航
    const breadcrumbHome = document.getElementById('breadcrumbHome');
    if (breadcrumbHome) {
        breadcrumbHome.addEventListener('click', () => {
            switchToGroupListView();
        });
    }

    // 初始化頁面
    initializePage();
});

// 2. 從 API 載入群組列表資料
async function loadGroupsFromAPI() {
    const apiUrl = `${window.location.protocol}//${window.location.host}/Role/Admin`;

    try {
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 加入 ngrok 需要的 header - 重要修正!!!
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${res.statusText} - ${errorText}`);
        }

        // 檢查回應內容
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (jsonError) {
            throw new Error("JSON解析失敗: " + jsonError.message);
        }

        console.log("成功取得群組資料:", data);
        originalGroupData = Array.isArray(data) ? data : [];

        // 初始化時重建 filteredGroupData
        rebuildFilteredGroupData();

        // 移除載入中提示
        const loadingContainer = document.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }

        renderGroupList();
        updatePagination();

    } catch (err) {
        console.error("群組 API 錯誤", err);
        showError(`無法載入群組資料：${err.message}`);
    }
}

// 3. 從 API 載入特定群組的使用者資料
async function loadGroupUsersFromAPI(groupId) {
    const apiUrl = `${window.location.protocol}//${window.location.host}/Role/GET/UserGroup?groupID=${encodeURIComponent(groupId)}`;

    try {
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 加入 ngrok 需要的 header - 重要修正!!!
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        console.log("成功取得群組使用者資料:", data);
        originalUserData = Array.isArray(data) ? data : [];

        // 重建篩選後的使用者資料
        rebuildFilteredUserData();

        renderGroupDetail();
        updatePagination();

    } catch (err) {
        console.error("群組使用者 API 錯誤", err);
        showError(`無法載入群組使用者資料：${err.message}`);
    }
}

// 4. 重建篩選後的群組資料
function rebuildFilteredGroupData() {
    const groupNameFilter = searchGroupName.value.toLowerCase();

    filteredGroupData = originalGroupData.filter(item => {
        const groupNameMatch = safeValue(item.groupName).toLowerCase().includes(groupNameFilter);
        return groupNameMatch;
    });
}

// 5. 重建篩選後的使用者資料
function rebuildFilteredUserData() {
    const userNameFilter = searchUserName.value.toLowerCase();
    const roleFilter = searchRole.value;

    // 基於原始數據重建，然後應用變更
    filteredUserData = originalUserData
        .filter(item => {
            const userNameMatch = safeValue(item.userName).toLowerCase().includes(userNameFilter);
            const roleMatch = roleFilter === '' || item.roleID.toString() === roleFilter;
            return userNameMatch && roleMatch;
        })
        .map(item => {
            // 深度複製原始項目
            const itemCopy = JSON.parse(JSON.stringify(item));

            // 如果有變更記錄，則應用變更
            const changeKey = `${item.groupID}-${item.externalID}`;
            if (currentChanges.has(changeKey)) {
                const changes = currentChanges.get(changeKey);
                Object.assign(itemCopy, changes);
            }

            return itemCopy;
        });

    // 應用排序
    applySorting();
}

// 新增排序功能
function applySorting() {
    if (currentSort === 'asc') {
        filteredUserData.sort((a, b) => parseInt(a.roleID) - parseInt(b.roleID));
    } else if (currentSort === 'desc') {
        filteredUserData.sort((a, b) => parseInt(b.roleID) - parseInt(a.roleID));
    }
}

// 6. 應用篩選條件
function applyFilters() {
    if (currentView === 'groupList') {
        rebuildFilteredGroupData();
    } else {
        rebuildFilteredUserData();
    }
    currentPage = 1;
    renderCurrentView();
    updatePagination();
}

// 7. 重設篩選條件
function resetFilters() {
    if (currentView === 'groupList') {
        searchGroupName.value = '';
        rebuildFilteredGroupData();
    } else {
        searchUserName.value = '';
        searchRole.value = '';
        rebuildFilteredUserData();
    }
    currentPage = 1;
    renderCurrentView();
    updatePagination();
}

// 8. 切換到群組列表視圖
function switchToGroupListView() {
    currentView = 'groupList';
    currentGroupId = null;
    currentSort = 'none'; // 重置排序

    // 清除所有變更
    changedRows.clear();
    currentChanges.clear();
    updateSaveButtonVisibility();

    // 更新 UI
    document.getElementById('groupListView').style.display = 'block';
    document.getElementById('groupDetailView').style.display = 'none';
    document.getElementById('groupFilters').style.display = 'block';
    document.getElementById('userFilters').style.display = 'none';

    // 更新麵包屑
    document.getElementById('breadcrumbHome').classList.add('active');
    document.getElementById('breadcrumbSeparator').style.display = 'none';
    document.getElementById('breadcrumbGroup').style.display = 'none';

    // 更新頁面控制項標籤
    document.getElementById('itemsLabel').textContent = '每頁顯示：';
    document.getElementById('itemsPerPage').innerHTML = `
        <option value="5">5個群組</option>
        <option value="10" selected>10個群組</option>
        <option value="20">20個群組</option>
        <option value="50">50個群組</option>
    `;

    currentPage = 1;
    renderGroupList();
    updatePagination();
}

// 9. 切換到群組詳情視圖
async function switchToGroupDetailView(groupId, groupName) {
    currentView = 'groupDetail';
    currentGroupId = groupId;

    // 更新 UI
    document.getElementById('groupListView').style.display = 'none';
    document.getElementById('groupDetailView').style.display = 'block';
    document.getElementById('groupFilters').style.display = 'none';
    document.getElementById('userFilters').style.display = 'block';

    // 更新麵包屑
    document.getElementById('breadcrumbHome').classList.remove('active');
    document.getElementById('breadcrumbSeparator').style.display = 'inline';
    document.getElementById('breadcrumbGroup').style.display = 'inline';
    document.getElementById('breadcrumbGroup').textContent = groupName;

    // 更新群組名稱顯示
    document.getElementById('currentGroupName').textContent = groupName;

    // 更新頁面控制項標籤
    document.getElementById('itemsLabel').textContent = '每頁顯示：';
    document.getElementById('itemsPerPage').innerHTML = `
        <option value="5">5個使用者</option>
        <option value="10" selected>10個使用者</option>
        <option value="20">20個使用者</option>
        <option value="50">50個使用者</option>
    `;

    // 顯示載入中
    document.getElementById('groupDetailContent').innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>載入群組成員資料中，請稍候...</p>
        </div>
    `;

    currentPage = 1;
    await loadGroupUsersFromAPI(groupId);
}

// 10. 渲染當前視圖
function renderCurrentView() {
    if (currentView === 'groupList') {
        renderGroupList();
    } else {
        renderGroupDetail();
    }
}

// 11. 渲染群組列表
function renderGroupList() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = filteredGroupData.slice(startIndex, endIndex);

    const groupListView = document.getElementById('groupListView');
    if (!groupListView) return;

    if (currentPageData.length === 0) {
        groupListView.innerHTML = '<div class="no-data">沒有找到匹配的群組</div>';
        return;
    }

    // 創建群組卡片
    let htmlContent = '<div class="group-list">';
    currentPageData.forEach(group => {
        htmlContent += createGroupCard(group);
    });
    htmlContent += '</div>';

    groupListView.innerHTML = htmlContent;

    // 為每個群組卡片綁定點擊事件
    currentPageData.forEach(group => {
        const groupCard = document.querySelector(`[data-group-id="${group.groupID}"]`);
        if (groupCard) {
            groupCard.addEventListener('click', () => {
                switchToGroupDetailView(group.groupID, group.groupName);
            });
        }
    });
}

// 12. 創建群組卡片HTML
function createGroupCard(group) {
    return `
        <div class="group-card" data-group-id="${group.groupID}">
            <div class="group-card-name">${safeValue(group.groupName)}</div>
            <div class="group-card-info">點擊查看群組成員</div>
        </div>
    `;
}

// 13. 渲染群組詳情
function renderGroupDetail() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = filteredUserData.slice(startIndex, endIndex);

    const groupDetailContent = document.getElementById('groupDetailContent');
    if (!groupDetailContent) return;

    if (currentPageData.length === 0) {
        groupDetailContent.innerHTML = '<div class="no-data">此群組沒有成員或沒有找到匹配的使用者</div>';
        return;
    }

    // 創建使用者表格 - 只顯示使用者名稱和權限設定
    let htmlContent = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>使用者名稱</th>
                    <th>
                        <div class="sort-header" onclick="toggleSort()">
                            權限設定
                            <div class="sort-arrows">
                                <span class="sort-arrow ${currentSort === 'asc' ? 'active' : ''}">▲</span>
                                <span class="sort-arrow ${currentSort === 'desc' ? 'active' : ''}">▼</span>
                            </div>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
    `;

    currentPageData.forEach(user => {
        htmlContent += createUserRow(user);
    });

    htmlContent += `
            </tbody>
        </table>
    `;

    groupDetailContent.innerHTML = htmlContent;

    // 為每個使用者行綁定事件
    currentPageData.forEach(user => {
        bindUserRowEvents(user);
    });
}

// 14. 創建使用者行HTML - 只顯示使用者名稱和權限設定
function createUserRow(user) {
    const originalUser = originalUserData.find(orig =>
        orig.groupID === user.groupID && orig.externalID === user.externalID
    );

    let roleSelectClass = 'role-select';

    if (originalUser) {
        const originalRole = parseInt(originalUser.roleID);
        const currentRole = parseInt(user.roleID);
        if (originalRole !== currentRole) {
            roleSelectClass += ' changed';
        }
    }

    let roleOptions = '';
    // 移除無權限選項，只顯示 1-4
    for (let i = 1; i <= 4; i++) {
        const selected = i === parseInt(user.roleID) ? 'selected' : '';
        roleOptions += `<option value="${i}" ${selected}>${i} - ${roleMap[i]}</option>`;
    }

    return `
        <tr>
            <td>${safeValue(user.userName)}</td>
            <td>
                <select class="${roleSelectClass}" data-group-id="${user.groupID}" data-external-id="${user.externalID}">
                    ${roleOptions}
                </select>
            </td>
        </tr>
    `;
}

// 15. 綁定使用者行事件
function bindUserRowEvents(user) {
    const roleSelect = document.querySelector(`select[data-group-id="${user.groupID}"][data-external-id="${user.externalID}"]`);
    if (roleSelect) {
        roleSelect.addEventListener('change', function(e) {
            const newRoleId = parseInt(e.target.value);
            handleRoleChange(e.target, user.groupID, user.externalID, newRoleId);
        });
    }
}

// 16. 處理權限變更
function handleRoleChange(element, groupId, externalId, newRoleId) {
    console.log('=== 權限變更處理開始 ===');
    console.log('參數:', { groupId, externalId, newRoleId });

    const originalUser = originalUserData.find(user =>
        user.groupID === groupId && user.externalID === externalId
    );

    if (!originalUser) {
        console.error('找不到原始使用者資料:', { groupId, externalId });
        return;
    }

    const originalRole = parseInt(originalUser.roleID);
    const newRole = parseInt(newRoleId);

    // 判斷是否與原始值不同
    const isChanged = originalRole !== newRole;
    const changeKey = `${groupId}-${externalId}`;

    console.log('比較結果:', {
        isChanged,
        originalRole,
        newRole,
        changeKey
    });

    if (isChanged) {
        // 有變更：加入紅色樣式和記錄變更
        element.classList.add('changed');

        if (!currentChanges.has(changeKey)) {
            currentChanges.set(changeKey, {
                externalID: externalId,
                lineID: originalUser.lineID,
                userName: originalUser.userName,
                groupID: groupId,
                groupName: originalUser.groupName,
                roleID: newRole
            });
        } else {
            currentChanges.get(changeKey).roleID = newRole;
        }
        changedRows.add(changeKey);

    } else {
        // 沒有變更：移除紅色樣式和變更記錄
        element.classList.remove('changed');

        if (currentChanges.has(changeKey)) {
            currentChanges.delete(changeKey);
            changedRows.delete(changeKey);
        }
    }

    // 重建 filteredUserData 以反映變更
    rebuildFilteredUserData();

    // 重新渲染當前頁面
    renderGroupDetail();

    console.log('當前狀態:', {
        changedRowsSize: changedRows.size,
        currentChangesSize: currentChanges.size
    });

    updateSaveButtonVisibility();
}

// 17. 分頁控制
function updatePagination() {
    const totalItems = getCurrentTotalItems();
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
    const itemType = currentView === 'groupList' ? '群組' : '使用者';
    pageInfo.textContent = `顯示 ${startItem}-${endItem} 項，共 ${totalItems} 個${itemType}`;
}

// 18. 取得當前總項目數
function getCurrentTotalItems() {
    return currentView === 'groupList' ? filteredGroupData.length : filteredUserData.length;
}

// 19. 取得當前總頁數
function getCurrentTotalPages() {
    const totalItems = getCurrentTotalItems();
    return Math.ceil(totalItems / itemsPerPage);
}

// 20. 更新儲存按鈕顯示
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

// 21. 儲存變更
async function saveChanges() {
    const changedData = getChangedData();

    console.log('=== 準備儲存變更 ===');
    console.log('changedRows:', Array.from(changedRows));
    console.log('currentChanges:', Array.from(currentChanges.entries()));
    console.log('準備傳送的資料:', JSON.stringify(changedData, null, 2));

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
        console.log('請求內容:', JSON.stringify(changedData, null, 2));

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // 加入 ngrok 需要的 header - 重要修正!!!
                'ngrok-skip-browser-warning': 'true'
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

        // 立即將當前頁面上所有紅色框框變成綠色
        document.querySelectorAll('.changed').forEach(element => {
            element.classList.remove('changed');
            element.classList.add('saved');
        });

        // 儲存成功後，將變更應用到原始數據
        currentChanges.forEach((changes, changeKey) => {
            const [groupId, externalId] = changeKey.split('-');
            const originalIndex = originalUserData.findIndex(user =>
                user.groupID === groupId && user.externalID === externalId
            );
            if (originalIndex !== -1) {
                originalUserData[originalIndex] = { ...originalUserData[originalIndex], ...changes };
            }
        });

        // 清除變更標記
        changedRows.clear();
        currentChanges.clear();
        updateSaveButtonVisibility();

        // 更新 filteredUserData 以保持數據同步
        rebuildFilteredUserData();

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

// 22. 取消變更
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

    // 重建 filteredUserData（此時 currentChanges 已清空，所以會還原到原始狀態）
    rebuildFilteredUserData();

    // 重新渲染
    renderGroupDetail();
    updateSaveButtonVisibility();

    console.log('取消後 - changedRows:', changedRows.size, 'currentChanges:', currentChanges.size);
    console.log('已取消所有變更，數據已還原到原始狀態');
}

// 新增排序切換功能
function toggleSort() {
    if (currentSort === 'none') {
        currentSort = 'asc';
    } else if (currentSort === 'asc') {
        currentSort = 'desc';
    } else {
        currentSort = 'none';
    }

    console.log('排序模式切換為:', currentSort);

    // 重新應用篩選和排序
    rebuildFilteredUserData();

    // 重新渲染當前頁面
    currentPage = 1; // 排序後回到第一頁
    renderGroupDetail();
    updatePagination();
}

// 23. 取得變更資料
function getChangedData() {
    const changedData = [];

    currentChanges.forEach((changes, changeKey) => {
        changedData.push(changes);
    });

    return changedData;
}

// 24. 創建頁碼按鈕
function createPageButton(pageNum) {
    const button = document.createElement('button');
    button.textContent = pageNum;
    button.addEventListener('click', function() {
        currentPage = pageNum;
        renderCurrentView();
        updatePagination();
    });

    if (pageNum === currentPage) {
        button.classList.add('active');
    }

    pageNumbers.appendChild(button);
}

// 25. 創建省略號
function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.style.padding = '8px 12px';
    ellipsis.style.color = '#666';
    pageNumbers.appendChild(ellipsis);
}

// 26. 顯示錯誤訊息
function showError(message) {
    const groupsContainer = document.getElementById('groupsContainer');
    if (groupsContainer) {
        groupsContainer.innerHTML = `
            <div class="error-message">
                ${message}<br>
                請檢查網路連線或聯繫系統管理員
            </div>
        `;
    }
}

// 27. 初始化頁面
function initializePage() {
    loadGroupsFromAPI();
}

// 28. 安全處理null值
function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '' : value;
}

// 將函數暴露到全域作用域，供外部調用
window.getChangedData = getChangedData;
window.resetFilters = resetFilters;
window.saveChanges = saveChanges;
window.cancelChanges = cancelChanges;
window.switchToGroupListView = switchToGroupListView;
window.toggleSort = toggleSort;