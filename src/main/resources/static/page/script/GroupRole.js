

// ==================== LIFF 驗證相關 ====================
let accessToken = null;
let userInfo = null;

// LIFF 初始化函數 - 超簡化測試版
async function initLIFFAuth() {
    try {

        await liff.init({
            // liffId: '2008232728-npRj74R0' //部署時註解
            liffId: '2008239415-pKx0DNmY' //開發時註解
        });


        if (!liff.isLoggedIn()) {
            console.log('未登入，跳轉登入');
            liff.login({ redirectUri: window.location.href });
            return null;
        }


        accessToken = liff.getAccessToken();

        // 🔥 關鍵：完全不讀取 profile
        userInfo = {
            accessToken: accessToken,
            userId: 'test-user',
            displayName: '測試用戶',
            pictureUrl: null
        };

        return userInfo;

    } catch (error) {
        console.error('❌ 錯誤發生在:', error);
        return null; // 不要 throw，改成 return null
    }
}

// 驗證管理員權限
async function verifyAdminPermission() {
    try {
        // 修改這裡：改用你的路由
        const response = await fetch(`${window.location.protocol}//${window.location.host}/Role/userLogin`, {
            method: 'POST',  // 你的 API 是 POST
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (response.ok) {
            // 額外讀取回應內容來確認
            const isAdmin = await response.json();
            return true;
        } else {
            console.log('❌ 驗證失敗 - Status:', response.status);
            showUnauthorizedPage();
            return false;
        }

    } catch (error) {
        console.error('❌ 權限驗證發生錯誤:', error);
        showUnauthorizedPage();
        return false;
    }
}

function showUnauthorizedPage() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #00a19c 0%, #008b87 100%);
            padding: 20px;
        ">
            <div style="
                background: white;
                padding: 60px 40px;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                max-width: 500px;
            ">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="#ff4d4f" style="margin-bottom: 30px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h1 style="color: #ff4d4f; font-size: 28px; margin-bottom: 16px;">無權限訪問</h1>
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    抱歉，您不是管理員，無法訪問此頁面。<br>
                    請聯繫系統管理員取得權限。
                </p>
                <button 
                    onclick="liff.logout(); window.location.reload()" 
                    onmouseover="this.style.background='#007a85'; this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.background='#00a19c'; this.style.transform='translateY(0)'"
                    style="
                        background: #00a19c;
                        color: white;
                        border: none;
                        padding: 14px 32px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                    重新登入
                </button>
            </div>
        </div>
    `;
}

// 全域變數
let allSalesPersons = [];
let allDoctors = [];
let originalGroupData = [];
let filteredGroupData = [];
let originalUserData = [];
let filteredUserData = [];
let currentPage = 1;
let itemsPerPage = 20; // 預設值,會動態計算
let currentView = 'groupList';
let currentGroupId = null;
let changedRows = new Set();
let currentChanges = new Map();
let currentSort = 'none';
let allClinics = [];
let groupNameChanges = new Map();

// DOM 元素
const searchGroupName = document.getElementById('searchGroupName');
const searchUserName = document.getElementById('searchUserName');
const searchRole = document.getElementById('searchRole');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');
const pageInfo = document.getElementById('pageInfo');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');

// 權限對應表
const roleMap = {
    1: "管理員",
    2: "醫師",
    3: "業務",
    4: "生產單位",
    5: "牙助",
    0: "失效人員"
};

// 計算每頁可以顯示的卡片數量
function calculateItemsPerPage() {
    if (currentView === 'groupList') {
        const container = document.getElementById('groupsContainer');
        if (!container) return 20;

        const containerWidth = container.offsetWidth - 40;
        const cardMinWidth = 180;
        const gap = 15;

        const cardsPerRow = Math.floor((containerWidth + gap) / (cardMinWidth + gap));
        const containerHeight = container.offsetHeight;
        const cardHeight = 100;
        const rowsPerPage = Math.floor((containerHeight - 40) / (cardHeight + gap));

        const calculatedItems = cardsPerRow * Math.max(rowsPerPage, 2);

        return Math.max(calculatedItems, 10);
    } else {
        return 20;
    }
}

// 排序切換函數
function toggleSort() {
    if (currentSort === 'none') {
        currentSort = 'asc';
    } else if (currentSort === 'asc') {
        currentSort = 'desc';
    } else {
        currentSort = 'none';
    }

    rebuildFilteredUserData();
    renderGroupDetail();
    updatePagination();
}

// 頁面載入初始化
window.addEventListener('DOMContentLoaded', () => {
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

    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelChangesBtn = document.getElementById('cancelChangesBtn');

    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', saveChanges);
    }

    if (cancelChangesBtn) {
        cancelChangesBtn.addEventListener('click', cancelChanges);
    }

    const breadcrumbHome = document.getElementById('breadcrumbHome');
    if (breadcrumbHome) {
        breadcrumbHome.addEventListener('click', () => {
            switchToGroupListView();
        });
    }

    initializePage();
});

// 視窗大小改變時重新計算
window.addEventListener('resize', () => {
    if (currentView === 'groupList') {
        const oldItemsPerPage = itemsPerPage;
        itemsPerPage = calculateItemsPerPage();

        if (oldItemsPerPage !== itemsPerPage) {
            currentPage = 1;
            renderGroupList();
            updatePagination();
        }
    }
});

// 載入業務人員資料
async function loadAllSalesPersons() {
    const apiUrl = `${window.location.protocol}//${window.location.host}/Person/GET/Sales`;

    try {
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        allSalesPersons = Array.isArray(data) ? data : [];

    } catch (err) {
        console.error("業務人員 API 錯誤", err);
        allSalesPersons = [];
    }
}

// 載入醫生資料
async function loadAllDoctors() {
    const apiUrl = `${window.location.protocol}//${window.location.host}/Person/GET/Doctor`;

    try {
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        allDoctors = Array.isArray(data) ? data : [];

    } catch (err) {
        console.error("醫生 API 錯誤", err);
        allDoctors = [];
    }
}

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

// 修正 rebuildFilteredUserData 函數 - 不要影響視覺樣式
function rebuildFilteredUserData() {
    const userNameFilter = searchUserName.value.toLowerCase();
    const roleFilter = searchRole.value;

    // 基於原始數據重建，然後應用變更（但不影響 DOM 樣式）
    filteredUserData = originalUserData
        .filter(item => {
            const userNameMatch = safeValue(item.userName).toLowerCase().includes(userNameFilter);
            const roleMatch = roleFilter === '' || item.roleID.toString() === roleFilter;
            return userNameMatch && roleMatch;
        })
        .map(item => {
            // 深度複製原始項目
            const itemCopy = JSON.parse(JSON.stringify(item));

            // 如果有變更記錄，則應用變更（只用於數據，不影響DOM）
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



// 在切換頁面或應用篩選時，保存當前的視覺狀態
function preserveVisualState() {
    const visualState = new Map();

    // 保存使用者名稱的顏色狀態
    document.querySelectorAll('.user-name-display').forEach(btn => {
        const container = btn.closest('[data-group-id][data-external-id]');
        if (container) {
            const groupId = container.getAttribute('data-group-id');
            const externalId = container.getAttribute('data-external-id');
            const key = `${groupId}-${externalId}`;
            visualState.set(`name-${key}`, {
                color: btn.style.color,
                fontWeight: btn.style.fontWeight,
                classList: Array.from(btn.classList)
            });
        }
    });

    // 保存權限選擇器的狀態
    document.querySelectorAll('.role-select').forEach(select => {
        const groupId = select.getAttribute('data-group-id');
        const externalId = select.getAttribute('data-external-id');
        const key = `${groupId}-${externalId}`;
        visualState.set(`role-${key}`, {
            classList: Array.from(select.classList)
        });
    });

    return visualState;
}

// 恢復視覺狀態
function restoreVisualState(visualState) {
    // 恢復使用者名稱的顏色狀態
    visualState.forEach((state, stateKey) => {
        if (stateKey.startsWith('name-')) {
            const key = stateKey.replace('name-', '');
            const [groupId, externalId] = key.split('-');
            const btn = document.querySelector(`[data-group-id="${groupId}"][data-external-id="${externalId}"] .user-name-display`);
            if (btn) {
                btn.style.color = state.color;
                btn.style.fontWeight = state.fontWeight;
                btn.className = state.classList.join(' ');
            }
        } else if (stateKey.startsWith('role-')) {
            const key = stateKey.replace('role-', '');
            const [groupId, externalId] = key.split('-');
            const select = document.querySelector(`select[data-group-id="${groupId}"][data-external-id="${externalId}"]`);
            if (select) {
                select.className = state.classList.join(' ');
            }
        }
    });
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

function switchToGroupListView() {
    currentView = 'groupList';
    currentGroupId = null;
    currentSort = 'none';

    changedRows.clear();
    currentChanges.clear();
    updateSaveButtonVisibility();

    document.getElementById('groupListView').style.display = 'block';
    document.getElementById('groupDetailView').style.display = 'none';
    document.getElementById('groupFilters').style.display = 'block';
    document.getElementById('userFilters').style.display = 'none';

    document.getElementById('breadcrumbHome').classList.add('active');
    document.getElementById('breadcrumbSeparator').style.display = 'none';
    document.getElementById('breadcrumbGroup').style.display = 'none';

    currentPage = 1;

    // 計算每頁應該顯示的項目數
    setTimeout(() => {
        itemsPerPage = calculateItemsPerPage();
        renderGroupList();
        updatePagination();
    }, 100);
}

async function switchToGroupDetailView(groupId, groupName) {
    currentView = 'groupDetail';
    currentGroupId = groupId;

    const isBusinessGroup = groupName.includes('業務');

    if (isBusinessGroup && allSalesPersons.length === 0) {
        await loadAllSalesPersons();
    } else if (!isBusinessGroup && allDoctors.length === 0) {
        await loadAllDoctors();
    }

    document.getElementById('groupListView').style.display = 'none';
    document.getElementById('groupDetailView').style.display = 'block';
    document.getElementById('groupFilters').style.display = 'none';
    document.getElementById('userFilters').style.display = 'block';

    document.getElementById('breadcrumbHome').classList.remove('active');
    document.getElementById('breadcrumbSeparator').style.display = 'inline';
    document.getElementById('breadcrumbGroup').style.display = 'inline';
    document.getElementById('breadcrumbGroup').textContent = groupName;

    document.getElementById('currentGroupName').textContent = groupName;

    document.getElementById('groupDetailContent').innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>載入群組成員資料中，請稍候...</p>
        </div>
    `;

    currentPage = 1;
    itemsPerPage = 20; // 使用者列表固定每頁20筆
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

    // 為每個群組卡片綁定事件
    currentPageData.forEach(group => {
        // 綁定群組名稱下拉選單事件
        bindGroupNameDropdownEvents(group.groupID);

        // 綁定點擊進入群組詳情的事件
        const clickableArea = document.querySelector(`[data-group-id="${group.groupID}"] .group-card-clickable-area`);
        if (clickableArea) {
            clickableArea.addEventListener('click', () => {
                switchToGroupDetailView(group.groupID, group.groupName);
            });
        }
    });
}

// 12. 創建群組卡片HTML
function createGroupCard(group) {
    const groupName = safeValue(group.groupName);
    return `
        <div class="group-card" data-group-id="${group.groupID}">
            <div class="group-name-dropdown-container">
                <button type="button" 
                        class="group-name-display" 
                        data-group-id="${group.groupID}"
                        title="${groupName}">
                    ${groupName}
                </button>
                <div class="clinic-options">
                    <input type="text" class="clinic-search" placeholder="搜尋診所...">
                    <div class="clinic-options-list">
                        ${createClinicOptionsList()}
                    </div>
                </div>
            </div>
            <div class="group-card-info group-card-clickable-area">點擊查看群組成員</div>
        </div>
    `;
}

// 修正 renderGroupDetail 以保持視覺狀態
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

    // 在重新渲染前保存視覺狀態
    const savedState = preserveVisualState();

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

    // 恢復視覺狀態
    setTimeout(() => {
        restoreVisualState(savedState);
    }, 10);
}



// 創建使用者行HTML - 修正版本
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

    // 修改这里，包含 0
    let roleOptions = '';
    const roleIds = [1, 2, 3, 4, 5, 0];  // 改为 0
    roleIds.forEach(i => {
        const selected = i === parseInt(user.roleID) ? 'selected' : '';
        roleOptions += `<option value="${i}" ${selected}>${i} - ${roleMap[i]}</option>`;
    });

    return `
        <tr>
            <td>
                <div class="user-name-dropdown-container" data-group-id="${user.groupID}" data-external-id="${user.externalID}" style="position: relative;">
                    <button type="button" class="user-name-display" style="background: transparent; border: 1px solid transparent; border-radius: 4px; padding: 8px 12px; cursor: pointer; width: 100%; text-align: left; font-size: 14px; transition: all 0.3s; position: relative;">
                        ${safeValue(user.userName)}
                        <span style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #008390;">▼</span>
                    </button>
                    <div class="user-options" style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid #008390; border-radius: 4px; max-height: 180px; overflow-y: auto; z-index: 1000; display: none; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                        <input type="text" class="user-search" placeholder="搜尋人員..." style="width: 100%; padding: 8px 12px; border: none; border-bottom: 1px solid #eee; font-size: 14px; outline: none; box-sizing: border-box;">
                        <div class="user-options-list" style="max-height: 140px; overflow-y: auto;">
                            <!-- 這裡會動態載入人員選項 -->
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <select class="${roleSelectClass}" data-group-id="${user.groupID}" data-external-id="${user.externalID}">
                    ${roleOptions}
                </select>
            </td>
        </tr>
    `;
}

// 創建人員選項列表HTML - 修正版本
function createUserOptionsList(isBusinessGroup) {
    const persons = isBusinessGroup ? allSalesPersons : allDoctors;

    if (persons.length === 0) {
        return '<div class="user-option" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee; transition: background-color 0.2s; font-size: 14px;">載入人員資料中...</div>';
    }

    let optionsHtml = '';
    persons.forEach(person => {
        // 根據不同的API回傳結構調整顯示內容
        const displayName = person.name || person.doctorName || person.salesName || person.userName || '未知';
        const personId = person.id || person.doctorId || person.salesId || person.personId || '';

        optionsHtml += `<div class="user-option" data-person-id="${personId}" data-person-name="${displayName}" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee; transition: background-color 0.2s; font-size: 14px;" onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='white'">${displayName}</div>`;
    });
    return optionsHtml;
}

// 綁定使用者行事件
function bindUserRowEvents(user) {
    const roleSelect = document.querySelector(`select[data-group-id="${user.groupID}"][data-external-id="${user.externalID}"]`);
    if (roleSelect) {
        roleSelect.addEventListener('change', function(e) {
            const newRoleId = parseInt(e.target.value);
            handleRoleChange(e.target, user.groupID, user.externalID, newRoleId);
        });
    }

    // 綁定使用者名稱下拉選單事件
    bindUserNameDropdownEvents(user);
}

// 綁定使用者名稱下拉選單事件 - 參照群組名稱搜尋功能修正版
function bindUserNameDropdownEvents(user) {
    const container = document.querySelector(`.user-name-dropdown-container[data-group-id="${user.groupID}"][data-external-id="${user.externalID}"]`);
    const userNameBtn = container?.querySelector('.user-name-display');
    const optionsContainer = container?.querySelector('.user-options');
    const searchInput = optionsContainer?.querySelector('.user-search');
    const optionsList = optionsContainer?.querySelector('.user-options-list');

    if (!userNameBtn || !optionsContainer || !searchInput || !optionsList) {
        console.error('找不到必要的元素:', { userNameBtn, optionsContainer, searchInput, optionsList });
        return;
    }

    // 判斷是否為業務群組
    const currentGroup = originalGroupData.find(g => g.groupID === currentGroupId);
    const isBusinessGroup = currentGroup?.groupName?.includes('業務') || false;

    // 點擊使用者名稱按鈕顯示下拉選單
    userNameBtn.addEventListener('click', function(e) {
        e.stopPropagation();

        // 關閉其他已開啟的下拉選單
        document.querySelectorAll('.user-options').forEach(el => {
            if (el !== optionsContainer) {
                el.style.display = 'none';
            }
        });

        // 切換當前下拉選單
        const isVisible = optionsContainer.style.display === 'block';

        if (!isVisible) {
            // 計算按鈕位置並設定 fixed 定位
            const btnRect = userNameBtn.getBoundingClientRect();
            optionsContainer.style.position = 'fixed';
            optionsContainer.style.top = `${btnRect.bottom + 2}px`;
            optionsContainer.style.left = `${btnRect.left}px`;
            optionsContainer.style.width = `${btnRect.width}px`;
            optionsContainer.style.display = 'block';

            searchInput.focus();
            searchInput.value = '';

            // 載入人員選項
            optionsList.innerHTML = createUserOptionsList(isBusinessGroup);
            // 參照群組搜尋：初始化時不過濾，顯示所有選項
            filterUserOptions(user.groupID, user.externalID, '');
        } else {
            optionsContainer.style.display = 'none';
        }
    });

    // 搜尋輸入事件 - 參照群組名稱搜尋的方式
    searchInput.addEventListener('input', function(e) {
        e.stopPropagation();
        const searchTerm = this.value.toLowerCase();
        filterUserOptions(user.groupID, user.externalID, searchTerm);
    });

    // 防止搜尋框點擊事件冒泡
    searchInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // 點擊選項事件
    optionsList.addEventListener('click', function(e) {
        e.stopPropagation();
        if (e.target.classList.contains('user-option')) {
            const personId = e.target.dataset.personId;      // 這就是 userNameID
            const personName = e.target.dataset.personName;

            // 更新顯示文字
            userNameBtn.childNodes[0].textContent = personName;

            // 隱藏下拉選單
            optionsContainer.style.display = 'none';

            // 處理使用者名稱變更 - 傳遞 personId 作為 userNameID
            handleUserNameChange(user.groupID, user.externalID, personName, personId);
        }
    });

    // 點擊外部關閉下拉選單
    const closeDropdown = function(e) {
        if (!container.contains(e.target)) {
            optionsContainer.style.display = 'none';
        }
    };

    document.addEventListener('click', closeDropdown);
}

// 修正版本的 handleUserNameChange 函數 - 處理 userNameID
function handleUserNameChange(groupId, externalId, newUserName, newUserNameID) {
    const originalUser = originalUserData.find(user =>
        user.groupID === groupId && user.externalID === externalId
    );

    if (!originalUser) {
        console.error('找不到原始使用者資料:', { groupId, externalId });
        return;
    }

    const userNameBtn = document.querySelector(`[data-group-id="${groupId}"][data-external-id="${externalId}"] .user-name-display`);
    if (!userNameBtn) {
        console.error('找不到使用者名稱按鈕元素');
        return;
    }

    const originalUserName = originalUser.userName;
    const originalUserNameID = originalUser.userNameID; // 原始的 userNameID

    // 檢查使用者名稱和 userNameID 是否有變更
    const isUserNameChanged = originalUserName !== newUserName;
    const isUserNameIDChanged = originalUserNameID !== newUserNameID;
    const isUserChanged = isUserNameChanged || isUserNameIDChanged;

    const changeKey = `${groupId}-${externalId}`;

    // 檢查權限是否也有變更
    const roleSelect = document.querySelector(`select[data-group-id="${groupId}"][data-external-id="${externalId}"]`);
    const currentRoleId = roleSelect ? parseInt(roleSelect.value) : originalUser.roleID;
    const isRoleChanged = parseInt(originalUser.roleID) !== currentRoleId;

    console.log('變更檢查:', {
        originalUserName,
        newUserName,
        originalUserNameID,
        newUserNameID,
        isUserNameChanged,
        isUserNameIDChanged,
        isUserChanged
    });

    // 更新變更記錄
    if (isUserChanged || isRoleChanged) {
        if (!currentChanges.has(changeKey)) {
            currentChanges.set(changeKey, {
                externalID: externalId,
                lineID: originalUser.lineID,
                userName: newUserName,
                userNameID: newUserNameID,     // 加上這個欄位
                groupID: groupId,
                groupName: originalUser.groupName,
                roleID: currentRoleId
            });
        } else {
            // 更新現有的變更記錄
            const existingChange = currentChanges.get(changeKey);
            existingChange.userName = newUserName;
            existingChange.userNameID = newUserNameID;  // 也要更新這個
        }
        changedRows.add(changeKey);
    } else {
        if (currentChanges.has(changeKey)) {
            currentChanges.delete(changeKey);
            changedRows.delete(changeKey);
        }
    }

    // **只處理使用者名稱欄位的視覺效果**
    if (isUserNameChanged) {
        userNameBtn.style.color = '#dc3545';
        userNameBtn.style.fontWeight = 'bold';
        userNameBtn.classList.remove('saved', 'saved-fadeout');
    } else {
        userNameBtn.style.color = '';
        userNameBtn.style.fontWeight = '';
        userNameBtn.classList.remove('saved', 'saved-fadeout');
    }

    updateSaveButtonVisibility();
}



// 過濾使用者選項 - 參照群組名稱搜尋的實現方式
function filterUserOptions(groupId, externalId, searchTerm) {
    const options = document.querySelectorAll(`[data-group-id="${groupId}"][data-external-id="${externalId}"] .user-option`);

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}


// 處理權限變更 - 完全移除重新渲染的版本
function handleRoleChange(element, groupId, externalId, newRoleId) {
    const originalUser = originalUserData.find(user =>
        user.groupID === groupId && user.externalID === externalId
    );

    if (!originalUser) {
        console.error('找不到原始使用者資料:', { groupId, externalId });
        return;
    }

    const originalRole = parseInt(originalUser.roleID);
    const newRole = parseInt(newRoleId);
    const changeKey = `${groupId}-${externalId}`;

    // 檢查使用者名稱是否也有變更
    const userNameBtn = document.querySelector(`[data-group-id="${groupId}"][data-external-id="${externalId}"] .user-name-display`);
    const currentUserName = userNameBtn ? userNameBtn.childNodes[0].textContent : originalUser.userName;
    const isUserNameChanged = originalUser.userName !== currentUserName;

    // 判斷權限是否與原始值不同
    const isRoleChanged = originalRole !== newRole;

    // 更新或創建變更記錄
    if (isRoleChanged || isUserNameChanged) {
        if (!currentChanges.has(changeKey)) {
            currentChanges.set(changeKey, {
                externalID: externalId,
                lineID: originalUser.lineID,
                userName: currentUserName,
                groupID: groupId,
                groupName: originalUser.groupName,
                roleID: newRole
            });
        } else {
            // 只更新權限部分
            currentChanges.get(changeKey).roleID = newRole;
        }
        changedRows.add(changeKey);
    } else {
        // 如果兩者都沒有變更，完全移除變更記錄
        if (currentChanges.has(changeKey)) {
            currentChanges.delete(changeKey);
            changedRows.delete(changeKey);
        }
    }

    // **關鍵修正：只處理權限選擇欄位的視覺效果，不重新渲染**
    if (isRoleChanged) {
        // 權限有變更：標記為紅色
        element.classList.remove('saved', 'saved-fadeout');
        element.classList.add('changed');
    } else {
        // 權限沒有變更：移除紅色樣式
        element.classList.remove('changed', 'saved', 'saved-fadeout');
    }

    // **移除這些會破壞顏色標記的程式碼！**
    // rebuildFilteredUserData();  // <- 刪除這行
    // renderGroupDetail();        // <- 刪除這行
    // setTimeout(() => { ... });  // <- 刪除這整個 setTimeout

    updateSaveButtonVisibility();
}


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

    // 只顯示頁數資訊，不顯示每頁數量
    pageInfo.textContent = `第 ${currentPage} 頁，共 ${totalPages} 頁 (共 ${totalItems} 個${itemType})`;
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

// 18. 取得當前總項目數
function getCurrentTotalItems() {
    return currentView === 'groupList' ? filteredGroupData.length : filteredUserData.length;
}

// 19. 取得當前總頁數
function getCurrentTotalPages() {
    const totalItems = getCurrentTotalItems();
    return Math.ceil(totalItems / itemsPerPage);
}

// 加強的 updateSaveButtonVisibility 函數
function updateSaveButtonVisibility() {

    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelChangesBtn = document.getElementById('cancelChangesBtn');

    // 檢查是否有任何變更（成員權限變更或群組名稱變更）
    const hasRoleChanges = changedRows.size > 0;
    const hasGroupNameChanges = groupNameChanges.size > 0;
    const hasChanges = hasRoleChanges || hasGroupNameChanges;


    if (hasChanges) {
        if (saveChangesBtn) {
            saveChangesBtn.style.display = 'inline-block';
        } else {
            console.error('找不到 saveChangesBtn 元素');
        }
        if (cancelChangesBtn) {
            cancelChangesBtn.style.display = 'inline-block';
        } else {
            console.error('找不到 cancelChangesBtn 元素');
        }
    } else {
        if (saveChangesBtn) saveChangesBtn.style.display = 'none';
        if (cancelChangesBtn) cancelChangesBtn.style.display = 'none';
    }
}


// 加強的 saveChanges 函數開頭部分
async function saveChanges() {

    // 收集所有要儲存的變更
    const groupNameChangesList = Array.from(groupNameChanges.values());
    const memberRoleChangesList = getChangedData();
    const totalChanges = groupNameChangesList.length + memberRoleChangesList.length;

    if (totalChanges === 0) {
        alert('沒有資料需要儲存');
        return;
    }

    if (!confirm(`確定要儲存 ${totalChanges} 筆變更嗎？`)) {
        return;
    }


    try {
        // 記錄需要變成綠色的元素
        const elementsToTurnGreen = [];

        // 處理群組名稱變更
        if (groupNameChangesList.length > 0) {
            // 記錄群組名稱元素（變更前先記錄，因為 saveGroupNameChanges 會更新 DOM）
            groupNameChangesList.forEach(change => {
                const groupCard = document.querySelector(`[data-group-id="${change.groupID}"]`);
                if (groupCard && groupCard.classList.contains('changed')) {
                    elementsToTurnGreen.push({
                        type: 'groupName',
                        element: groupCard
                    });
                }
            });

            // 直接調用群組名稱更新函數
            await saveGroupNameChanges();
        }

        // 處理成員權限變更
        if (memberRoleChangesList.length > 0) {
            // 記錄使用者名稱和權限元素
            memberRoleChangesList.forEach(change => {
                const originalUser = originalUserData.find(user =>
                    String(user.groupID) === String(change.groupID) &&
                    String(user.externalID) === String(change.externalID)
                );

                if (originalUser) {
                    // 檢查使用者名稱是否有變更
                    if (originalUser.userName !== change.userName) {
                        const userNameBtn = document.querySelector(`[data-group-id="${change.groupID}"][data-external-id="${change.externalID}"] .user-name-display`);
                        if (userNameBtn && userNameBtn.style.color === 'rgb(220, 53, 69)') {
                            elementsToTurnGreen.push({
                                type: 'userName',
                                element: userNameBtn
                            });
                        }
                    }

                    // 檢查權限是否有變更
                    if (parseInt(originalUser.roleID) !== parseInt(change.roleID)) {
                        const roleSelect = document.querySelector(`select[data-group-id="${change.groupID}"][data-external-id="${change.externalID}"]`);
                        if (roleSelect && roleSelect.classList.contains('changed')) {
                            elementsToTurnGreen.push({
                                type: 'role',
                                element: roleSelect
                            });
                        }
                    }
                }
            });

            // 調用成員權限更新 API
            const apiUrl = `${window.location.protocol}//${window.location.host}/Role/update`;
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(memberRoleChangesList)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            // 更新成員資料的原始數據
            memberRoleChangesList.forEach(change => {
                const originalIndex = originalUserData.findIndex(user => {
                    const groupMatch = String(user.groupID) === String(change.groupID);
                    const externalMatch = String(user.externalID) === String(change.externalID);
                    return groupMatch && externalMatch;
                });

                if (originalIndex !== -1) {
                    originalUserData[originalIndex].roleID = change.roleID;
                    originalUserData[originalIndex].userName = change.userName;
                }
            });
        }

        // 清除所有變更記錄
        changedRows.clear();
        currentChanges.clear();
        groupNameChanges.clear();

        // 立即應用綠色效果到之前記錄的元素
        elementsToTurnGreen.forEach(item => {
            if (item.type === 'userName') {
                item.element.style.color = '#28a745';
                item.element.style.fontWeight = 'bold';
                item.element.classList.remove('changed');
                item.element.classList.add('saved');
            } else if (item.type === 'role') {
                item.element.classList.remove('changed');
                item.element.classList.add('saved');
            } else if (item.type === 'groupName') {
                item.element.classList.remove('changed');
                item.element.classList.add('saved');
            }
        });

        // 如果在群組列表頁面，需要重新渲染以更新群組名稱顯示
        if (currentView === 'groupList') {
            rebuildFilteredGroupData();
            renderGroupList();

            // 重新套用群組卡片的綠色效果
            setTimeout(() => {
                groupNameChangesList.forEach(change => {
                    const groupCard = document.querySelector(`[data-group-id="${change.groupID}"]`);
                    if (groupCard) {
                        groupCard.classList.remove('changed');
                        groupCard.classList.add('saved');
                    }
                });
            }, 50);
        } else {
            // 在群組詳情頁面，更新 filteredUserData 但不重新渲染
            rebuildFilteredUserData();
        }

        // 顯示成功訊息
        alert('變更已成功儲存');
        updateSaveButtonVisibility();

        // 2秒後開始綠色漸變動畫
        setTimeout(() => {
            // 處理群組名稱的淡化效果
            document.querySelectorAll('.group-card.saved').forEach(element => {
                element.classList.add('saved-fadeout');
            });

            // 處理成員權限的淡化效果
            document.querySelectorAll('.role-select.saved').forEach(element => {
                element.classList.add('saved-fadeout');
            });

            // 處理使用者名稱的淡化效果
            document.querySelectorAll('.user-name-display.saved').forEach(element => {
                element.style.transition = 'color 1s ease, font-weight 1s ease';
                element.style.color = '#666';
                element.style.fontWeight = 'normal';
                element.classList.add('saved-fadeout');
            });

            // 再過1秒完全移除樣式
            setTimeout(() => {
                document.querySelectorAll('.group-card.saved, .role-select.saved').forEach(element => {
                    element.classList.remove('saved', 'saved-fadeout');
                });

                document.querySelectorAll('.user-name-display.saved').forEach(element => {
                    element.style.color = '';
                    element.style.fontWeight = '';
                    element.style.transition = '';
                    element.classList.remove('saved', 'saved-fadeout');
                });
            }, 1000);
        }, 2000);

    } catch (error) {
        console.error('儲存失敗:', error);
        alert('儲存失敗: ' + error.message);
    }
}


// 23. 取得變更資料
function getChangedData() {
    const changedData = [];

    currentChanges.forEach((changes, changeKey) => {
        changedData.push(changes);
    });

    return changedData;
}


// 取消變更 - 包含使用者名稱恢復
function cancelChanges() {
    if (!confirm('確定要取消所有變更嗎？')) {
        return;
    }

    // 恢復群組名稱變更
    groupNameChanges.forEach((change, groupId) => {
        const groupNameBtn = document.querySelector(`.group-name-display[data-group-id="${groupId}"]`);
        if (groupNameBtn) {
            groupNameBtn.textContent = change.originalGroupName;
        }

        // 移除變更樣式
        const groupCard = document.querySelector(`[data-group-id="${groupId}"]`);
        if (groupCard) {
            groupCard.classList.remove('changed');
        }
    });

    // 恢復使用者名稱和權限變更
    currentChanges.forEach((change, changeKey) => {
        const [groupId, externalId] = changeKey.split('-');

        // 找到原始使用者資料
        const originalUser = originalUserData.find(user =>
            user.groupID === groupId && user.externalID === externalId
        );

        if (originalUser) {
            // 恢復使用者名稱
            const userNameBtn = document.querySelector(`[data-group-id="${groupId}"][data-external-id="${externalId}"] .user-name-display`);
            if (userNameBtn) {
                userNameBtn.childNodes[0].textContent = originalUser.userName;
                userNameBtn.style.color = '';
                userNameBtn.style.fontWeight = '';
                userNameBtn.classList.remove('changed', 'saved', 'saved-fadeout');
            }

            // 恢復權限選擇
            const roleSelect = document.querySelector(`select[data-group-id="${groupId}"][data-external-id="${externalId}"]`);
            if (roleSelect) {
                roleSelect.value = originalUser.roleID;
                roleSelect.classList.remove('changed', 'saved', 'saved-fadeout');
            }
        }
    });

    // 清除所有變更記錄
    changedRows.clear();
    currentChanges.clear();
    groupNameChanges.clear();

    // 移除所有變更樣式
    document.querySelectorAll('.changed').forEach(el => {
        el.classList.remove('changed');
    });

    // 移除所有使用者名稱的顏色樣式
    document.querySelectorAll('.user-name-display').forEach(element => {
        element.style.color = '';
        element.style.fontWeight = '';
        element.classList.remove('changed', 'saved', 'saved-fadeout');
    });

    // 如果在群組詳情頁面，重建 filteredUserData（此時 currentChanges 已清空，所以會還原到原始狀態）
    if (currentView === 'groupDetail') {
        rebuildFilteredUserData();
        renderGroupDetail();
    } else if (currentView === 'groupList') {
        // 如果在群組列表頁面，重建 filteredGroupData
        rebuildFilteredGroupData();
        renderGroupList();
    }

    updateSaveButtonVisibility();
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

// 初始化頁面 - 測試版
async function initializePage() {
    try {

        // 第一步：LIFF 登入驗證
        const auth = await initLIFFAuth();

        if (!auth) {
            console.log('跳轉登入中...');
            return; // 直接返回，不繼續執行
        }

        // 第二步：驗證管理員權限
        const hasPermission = await verifyAdminPermission();

        if (!hasPermission) {
            console.log('>>> 步驟 2: ❌ 無權限');
            return;
        }

        await loadAllClinics();
        await loadGroupsFromAPI();

    } catch (error) {
        console.error('❌ 錯誤:', error);
        console.error('❌ 錯誤堆疊:', error.stack);
    }
}

// 28. 安全處理null值
function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '' : value;
}

// 以下新增函數加在JavaScript文件的末尾

// 載入所有診所資料
async function loadAllClinics() {
    const apiUrl = `${window.location.protocol}//${window.location.host}/Person/GET/Clinic`;

    try {
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        allClinics = Array.isArray(data) ? data : [];

        // 在診所資料後面加入"業務"選項
        allClinics.push({
            clinicId: "Sales0001",
            clinicName: "業務"
        });

        // 診所資料載入完成後，更新已存在的下拉選單
        updateAllClinicDropdowns();

    } catch (err) {
        console.error("診所 API 錯誤", err);
        // 即使 API 失敗，也要加入業務選項
        allClinics = [{
            clinicId: "Sales0001",
            clinicName: "業務"
        }];
        updateAllClinicDropdowns();
    }
}

// 更新所有診所下拉選單的內容
function updateAllClinicDropdowns() {
    const allOptionsLists = document.querySelectorAll('.clinic-options-list');
    allOptionsLists.forEach(optionsList => {
        optionsList.innerHTML = createClinicOptionsList();
    });
}

// 創建診所選項列表HTML
function createClinicOptionsList() {
    if (allClinics.length === 0) {
        return '<div class="clinic-option">載入診所資料中...</div>';
    }

    let optionsHtml = '';
    allClinics.forEach(clinic => {
        // 統一使用 clinicId-clinicName 的格式
        const displayText = `${clinic.clinicId}-${clinic.clinicName}`;
        optionsHtml += `<div class="clinic-option" data-clinic-id="${clinic.clinicId}" data-clinic-name="${clinic.clinicName}">${displayText}</div>`;
    });
    return optionsHtml;
}

// 在 bindGroupNameDropdownEvents 函數中加入更多調試資訊
function bindGroupNameDropdownEvents(groupId) {

    const groupNameBtn = document.querySelector(`.group-name-display[data-group-id="${groupId}"]`);
    const optionsContainer = document.querySelector(`[data-group-id="${groupId}"] .clinic-options`);
    const searchInput = document.querySelector(`[data-group-id="${groupId}"] .clinic-search`);
    const optionsList = document.querySelector(`[data-group-id="${groupId}"] .clinic-options-list`);
    const dropdownContainer = document.querySelector(`[data-group-id="${groupId}"] .group-name-dropdown-container`);
    const groupCard = document.querySelector(`[data-group-id="${groupId}"]`);


    if (!groupNameBtn || !optionsContainer || !searchInput || !optionsList) {
        console.error('缺少必要元素，無法綁定事件');
        return;
    }

    // 點擊群組名稱按鈕顯示下拉選單
    groupNameBtn.addEventListener('click', function(e) {
        e.stopPropagation();

        // 關閉其他已開啟的下拉選單，並移除它們的 active class
        document.querySelectorAll('.clinic-options').forEach(el => {
            if (el !== optionsContainer) {
                el.style.display = 'none';
            }
        });

        document.querySelectorAll('.group-name-dropdown-container').forEach(el => {
            if (el !== dropdownContainer) {
                el.classList.remove('active');
            }
        });

        document.querySelectorAll('.group-card').forEach(el => {
            if (el !== groupCard) {
                el.classList.remove('dropdown-active');
            }
        });

        // 切換當前下拉選單
        const isVisible = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            // 打開下拉選單時，添加 active class 提高 z-index
            dropdownContainer.classList.add('active');
            groupCard.classList.add('dropdown-active');
            searchInput.focus();
            searchInput.value = '';
            filterClinicOptions(groupId, '');
        } else {
            // 關閉下拉選單時，移除 active class
            dropdownContainer.classList.remove('active');
            groupCard.classList.remove('dropdown-active');
        }
    });

    // 點擊選項事件
    optionsList.addEventListener('click', function(e) {
        e.stopPropagation();

        if (e.target.classList.contains('clinic-option')) {
            const clinicId = e.target.dataset.clinicId;
            const clinicName = e.target.dataset.clinicName;
            const newGroupName = `${clinicId}-${clinicName}`;


            // 更新顯示文字
            const oldText = groupNameBtn.textContent;
            groupNameBtn.textContent = newGroupName;

            // 隱藏下拉選單並移除 active class
            optionsContainer.style.display = 'none';
            dropdownContainer.classList.remove('active');
            groupCard.classList.remove('dropdown-active');

            // 處理變更 - 這是關鍵步驟
            handleGroupNameChange(groupId, newGroupName);
        }
    });

    // 其他事件綁定...
    searchInput.addEventListener('input', function(e) {
        e.stopPropagation();
        const searchTerm = this.value.toLowerCase();
        filterClinicOptions(groupId, searchTerm);
    });

    searchInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    const closeDropdown = function(e) {
        if (!groupNameBtn.contains(e.target) && !optionsContainer.contains(e.target)) {
            optionsContainer.style.display = 'none';
            dropdownContainer.classList.remove('active');
            groupCard.classList.remove('dropdown-active');
        }
    };

    document.addEventListener('click', closeDropdown);
}

// 過濾診所選項 - 確認這個函數是否存在
function filterClinicOptions(groupId, searchTerm) {
    const options = document.querySelectorAll(`[data-group-id="${groupId}"] .clinic-option`);

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// 調試版本的 handleGroupNameChange 函數（已加強）
function handleGroupNameChange(groupId, newGroupName) {


    const originalGroup = originalGroupData.find(g => {
        return g.groupID === groupId;
    });

    if (!originalGroup) {
        console.error('找不到原始群組資料，groupId:', groupId);
        return;
    }


    const groupCard = document.querySelector(`[data-group-id="${groupId}"]`);


    if (!groupCard) {
        console.error('找不到群組卡片元素，groupId:', groupId);
        // 列出所有存在的群組卡片
        const allCards = document.querySelectorAll('[data-group-id]');
        return;
    }

    const originalGroupName = originalGroup.groupName;
    const isChanged = originalGroupName !== newGroupName;

    if (isChanged) {

        // 有變更：加入紅色樣式和記錄變更
        groupCard.classList.remove('saved', 'saved-fadeout');
        groupCard.classList.add('changed');

        const changeData = {
            groupID: groupId,
            newGroupName: newGroupName,
            originalGroupName: originalGroupName
        };


        groupNameChanges.set(groupId, changeData);


    } else {

        // 沒有變更：移除紅色樣式和變更記錄
        groupCard.classList.remove('changed', 'saved', 'saved-fadeout');
        groupNameChanges.delete(groupId);


    }

    updateSaveButtonVisibility();
}

// 調試版本的 saveGroupNameChanges 函數
async function saveGroupNameChanges() {


    if (groupNameChanges.size === 0) {
        return;
    }

    const changes = Array.from(groupNameChanges.values());
    const groupIDs = changes.map(c => c.groupID);
    const newGroupNames = changes.map(c => c.newGroupName);



    try {
        const apiUrl = `${window.location.protocol}//${window.location.host}/Role/update/GroupName`;
        const params = new URLSearchParams();

        groupIDs.forEach(id => params.append('groupIDs', id));
        newGroupNames.forEach(name => params.append('newGroupNames', name));

        const finalUrl = `${apiUrl}?${params}`;

        const response = await fetch(finalUrl, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API 錯誤響應:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const responseText = await response.text();

        // 更新原始數據
        groupNameChanges.forEach((change, groupId) => {
            const originalGroup = originalGroupData.find(g => g.groupID === groupId);
            if (originalGroup) {
                originalGroup.groupName = change.newGroupName;
            }

            const groupCard = document.querySelector(`[data-group-id="${groupId}"]`);
            if (groupCard) {
                groupCard.classList.remove('changed');
                groupCard.classList.add('saved');
            }
        });


        groupNameChanges.clear();

        // 重建資料
        rebuildFilteredGroupData();
        if (currentView === 'groupList') {
            renderGroupList();

            // 重新應用綠色樣式到新渲染的元素
            setTimeout(() => {
                changes.forEach(change => {
                    const groupCard = document.querySelector(`[data-group-id="${change.groupID}"]`);
                    if (groupCard) {
                        groupCard.classList.add('saved');
                        console.log(`重新應用 saved 樣式到群組 ${change.groupID}`);
                    }
                });
            }, 50);
        }


    } catch (error) {
        console.error('保存群組名稱失敗:', error);
        throw error;
    }
}

// 調試版本的 handleGroupNameChange 函數
function handleGroupNameChange(groupId, newGroupName) {


    const originalGroup = originalGroupData.find(g => g.groupID === groupId);
    if (!originalGroup) {
        console.error('找不到原始群組資料:', groupId);
        return;
    }

    const groupCard = document.querySelector(`[data-group-id="${groupId}"]`);
    if (!groupCard) {
        console.error('找不到群組卡片元素:', groupId);
        return;
    }

    const originalGroupName = originalGroup.groupName;
    const isChanged = originalGroupName !== newGroupName;



    if (isChanged) {
        // 有變更：加入紅色樣式和記錄變更
        groupCard.classList.remove('saved', 'saved-fadeout');
        groupCard.classList.add('changed');

        const changeData = {
            groupID: groupId,
            newGroupName: newGroupName,
            originalGroupName: originalGroupName
        };

        groupNameChanges.set(groupId, changeData);

    } else {
        // 沒有變更：移除紅色樣式和變更記錄
        groupCard.classList.remove('changed', 'saved', 'saved-fadeout');
        groupNameChanges.delete(groupId);

    }

    updateSaveButtonVisibility();
}

// 將函數暴露到全域作用域，供外部調用
window.getChangedData = getChangedData;
window.resetFilters = resetFilters;
window.saveChanges = saveChanges;
window.cancelChanges = cancelChanges;
window.switchToGroupListView = switchToGroupListView;
window.toggleSort = toggleSort;