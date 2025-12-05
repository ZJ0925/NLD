// ===== 瀏覽器返回阻止機制（保留原有） =====
(function() {
    'use strict';
    console.log('🔧 初始化返回阻止機制...');
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches.length > 0) {
            touchStartX = e.touches[0].pageX;
            touchStartY = e.touches[0].pageY;
        }
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
        if (!e.touches || e.touches.length === 0) return;
        const touchX = e.touches[0].pageX;
        const touchY = e.touches[0].pageY;
        const deltaX = touchX - touchStartX;
        const deltaY = Math.abs(touchY - touchStartY);

        if (touchStartX < 50 && deltaX > 10 && deltaX > deltaY) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 已阻止左邊緣滑動');
            return false;
        }
    }, { passive: false });

    window.history.pushState(null, '', window.location.href);

    window.addEventListener('popstate', function(event) {
        console.log('🚫 檢測到返回動作');
        window.history.pushState(null, '', window.location.href);

        const detailView = document.getElementById('detailView');
        const isDetailPage = detailView && detailView.style.display === 'block';

        if (isDetailPage) {
            console.log('📄 在詳細頁面，返回列表');
            if (typeof showList === 'function') {
                showList();
            }
        } else {
            console.log('📋 在列表頁面，阻止返回');
        }
        return false;
    });

    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            window.history.pushState(null, '', window.location.href);
            console.log('👁️ 頁面重新可見，重新推入歷史');
        }
    });

    console.log('✅ 返回阻止機制已啟用');
})();

let scrollPosition = 0;

// ===== NLDStorage 類（保留原有） =====
class NLDStorage {
    constructor() {
        this.dbName = 'NLDDatabase';
        this.version = 1;
        this.db = null;
        this.isReady = false;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB 初始化失敗，回退到 localStorage');
                this.isReady = false;
                resolve(false);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isReady = true;
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('nldData')) {
                    db.createObjectStore('nldData', { keyPath: 'id' });
                }
            };
        });
    }

    async saveData(data) {
        if (!this.isReady) {
            return this.saveToLocalStorage(data);
        }

        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['nldData'], 'readwrite');
                const store = transaction.objectStore('nldData');

                const clearRequest = store.clear();
                clearRequest.onsuccess = () => {
                    const addRequest = store.add({ id: 'workOrders', data: data, timestamp: Date.now() });
                    addRequest.onsuccess = () => {
                        resolve(true);
                    };
                    addRequest.onerror = () => reject(addRequest.error);
                };
                clearRequest.onerror = () => reject(clearRequest.error);
            });
        } catch (error) {
            console.error('IndexedDB 儲存失敗，回退到 localStorage:', error);
            return this.saveToLocalStorage(data);
        }
    }

    async getData() {
        if (!this.isReady) {
            return this.getFromLocalStorage();
        }

        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['nldData'], 'readonly');
                const store = transaction.objectStore('nldData');
                const request = store.get('workOrders');

                request.onsuccess = () => {
                    if (request.result && request.result.data) {
                        resolve(request.result.data);
                    } else {
                        resolve(this.getFromLocalStorage());
                    }
                };

                request.onerror = () => {
                    console.error('IndexedDB 讀取失敗，回退到 localStorage');
                    resolve(this.getFromLocalStorage());
                };
            });
        } catch (error) {
            console.error('IndexedDB 讀取失敗，回退到 localStorage:', error);
            return this.getFromLocalStorage();
        }
    }

    async clearData() {
        if (this.isReady && this.db) {
            try {
                return new Promise((resolve) => {
                    const transaction = this.db.transaction(['nldData'], 'readwrite');
                    const store = transaction.objectStore('nldData');
                    const request = store.clear();

                    request.onsuccess = () => {
                        resolve();
                    };

                    request.onerror = () => {
                        console.error('IndexedDB 清理失敗');
                        resolve();
                    };
                });
            } catch (error) {
                console.error('IndexedDB 清理錯誤:', error);
            }
        }

        try {
            localStorage.removeItem("nldData");
        } catch (error) {
            console.error('localStorage 清理失敗:', error);
        }
    }

    saveToLocalStorage(data) {
        try {
            const compressedData = this.compressData(data);
            localStorage.setItem("nldData", JSON.stringify(compressedData));
            return true;
        } catch (error) {
            console.error('localStorage 儲存也失敗:', error);
            if (error.name === 'QuotaExceededError') {
                alert('儲存空間不足，請聯繫開發人員優化數據結構');
            }
            return false;
        }
    }

    getFromLocalStorage() {
        try {
            const raw = localStorage.getItem("nldData");
            if (raw) {
                return JSON.parse(raw);
            }
            return null;
        } catch (error) {
            console.error('localStorage 讀取失敗:', error);
            return null;
        }
    }

    compressData(data) {
        if (!Array.isArray(data)) return data;

        return data.map(item => ({
            workOrderNum: item.workOrderNum,
            clinicName: item.clinicName,
            patientName: item.patientName,
            docName: item.docName,
            toothPosition: item.toothPosition ? String(item.toothPosition).substring(0, 50) : null,
            prodItem: item.prodItem,
            prodName: item.prodName ? String(item.prodName).substring(0, 100) : null,
            receivedDate: item.receivedDate,
            estFinishDate: item.estFinishDate,
            deliveryDate: item.deliveryDate,
            workOrderStatus: item.workOrderStatus,
            remarks: item.remarks ? String(item.remarks).substring(0, 200) : null,
            tim3Dh: item.tim3Dh
        })).filter(item => item.workOrderNum);
    }
}

const nldStorage = new NLDStorage();

async function emergencyCleanup() {
    try {
        await nldStorage.clearData();
        localStorage.clear();
        alert("已清理所有儲存數據，請重新載入頁面");
        window.location.reload();
    } catch (error) {
        console.error("緊急清理失敗:", error);
        alert("清理失敗，請手動清除瀏覽器數據");
    }
}

function deduplicateWorkOrders(data) {
    console.log('🔄 [DEDUPE] 去重前資料筆數:', data ? data.length : 0);
    const seen = new Set();
    return data.filter(item => {
        if (seen.has(item.workOrderNum)) {
            console.log('🔄 [DEDUPE] 發現重複工單:', item.workOrderNum);
            return false;
        }
        seen.add(item.workOrderNum);
        return true;
    });
}

window.emergencyCleanup = emergencyCleanup;

// 全局變數
let originalData = [];
let filteredData = [];
let currentDetailItem = null;

// ===== 日期格式化函數（保留原有） =====
function formatDate(dateInput) {
    if (!dateInput) return '-';

    let date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        return '-';
    }

    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
}

function formatFullDate(dateInput) {
    if (!dateInput) return '-';

    let date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        return '-';
    }

    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatTimeSlot(timeCode) {
    if (!timeCode) {
        return '';
    }

    const code = String(timeCode).trim();
    let result = '';

    if (code === '01') {
        result = '中午前';
    } else if (code === '02') {
        result = '5點前';
    } else {
        result = '';
    }

    return result;
}

function formatDateWithTimeSlot(dateInput, timeSlot) {
    const dateStr = formatDateShort(dateInput);
    const timeStr = formatTimeSlot(timeSlot);

    if (dateStr === '-') {
        return '-';
    }

    if (timeStr) {
        return `${dateStr} ${timeStr}`;
    }

    return dateStr;
}

function formatFullDateWithTimeSlot(dateInput, timeSlot) {
    const dateStr = formatFullDate(dateInput);
    const timeStr = formatTimeSlot(timeSlot);

    if (dateStr === '-') {
        return '-';
    }

    if (timeStr) {
        return `${dateStr} ${timeStr}`;
    }

    return dateStr;
}

function formatDateShort(dateInput) {
    if (!dateInput) return '-';

    let date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        return '-';
    }

    if (isNaN(date.getTime())) return '-';

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '-' : value;
}

function formatToothPosition(toothPosition) {
    if (!toothPosition) return '-';
    const str = toothPosition.toString();
    if (str.length > 20) {
        return str.substring(0, 17) + '...';
    }
    return str;
}

function formatStatusLabels(statusText) {
    if (!statusText) return '';

    if (statusText.includes('不計價') && statusText.includes('修整')) {
        statusText = statusText.replace(/不計價\s+修整/, '不計價-修整');
    }

    if (statusText.includes('不計價') && statusText.includes('重製')) {
        statusText = statusText.replace(/不計價\s+重製/, '不計價-重製');
    }

    return statusText;
}

function renderListItem(item) {
    const statusText = formatStatusLabels(item.statusLabels || '');

    return `
        <div class="work-item" onclick="showDetail('${item.workOrderNum}')">
            <div class="work-item-header">
                <div class="clinic-name">${safeValue(item.clinicName)}</div>
                ${statusText ? `<div class="status-text">${statusText}</div>` : ''}
                <div class="work-order-num">${safeValue(item.workOrderNum)}</div>
            </div>
            <div class="work-item-content">
                <div class="work-item-field">
                    <div class="label">患者</div>
                    <div class="value">${safeValue(item.patientName)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">業務</div>
                    <div class="value">${safeValue(item.salesName)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">醫師</div>
                    <div class="value">${safeValue(item.docName)}</div>
                </div>
            </div>
        </div>
    `;
}

const ITEMS_PER_PAGE = 50;
let currentDisplayCount = ITEMS_PER_PAGE;

function renderListView(dataList) {
    console.log('🎨 [RENDER] 開始渲染列表');
    console.log('🎨 [RENDER] 傳入資料:', dataList);
    console.log('🎨 [RENDER] 資料筆數:', dataList ? dataList.length : 0);
    const listView = document.getElementById('listView');

    if (!dataList || dataList.length === 0) {
        console.warn('⚠️ [RENDER] 無資料，顯示查無資料訊息');
        listView.innerHTML = '<div class="loading">查無資料</div>';
        return;
    }

    const itemsToShow = dataList.slice(0, currentDisplayCount);
    console.log('🎨 [RENDER] 要顯示的項目數:', itemsToShow.length);
    console.log('🎨 [RENDER] currentDisplayCount:', currentDisplayCount);
    const itemsHtml = itemsToShow.map(renderListItem).join('');

    listView.innerHTML = itemsHtml;

    if (dataList.length > currentDisplayCount) {
        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.className = 'load-more-container';
        loadMoreBtn.innerHTML = `
            <button class="load-more-btn" onclick="loadMoreItems()">
                載入更多 (還有 ${dataList.length - currentDisplayCount} 筆)
            </button>
        `;
        listView.appendChild(loadMoreBtn);
    }
}

function loadMoreItems() {
    currentDisplayCount += ITEMS_PER_PAGE;
    renderListView(filteredData);

    setTimeout(() => {
        const newItemIndex = Math.max(0, currentDisplayCount - ITEMS_PER_PAGE);
        const workItems = document.querySelectorAll('.work-item');
        if (workItems[newItemIndex]) {
            workItems[newItemIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

/**
 * ✅ 显示齒位詳細卡片 - Doc版本（不顯示單價）
 */
function displayToothPositionCards(detailDataList) {
    const container = document.getElementById('toothPositionContainer');

    if (!container) {
        console.error('找不到 toothPositionContainer 元素');
        return;
    }

    container.innerHTML = '';

    if (!detailDataList || detailDataList.length === 0) {
        container.innerHTML = '<div style="color: #999; padding: 12px; text-align: center;">暫無齒位資料</div>';
        return;
    }

    console.log('📊 開始顯示齒位卡片，共', detailDataList.length, '筆');

    detailDataList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'tooth-card';

        const cardHTML = `
            <div class="tooth-card-grid">
                <div>
                    <div class="tooth-card-field" style="margin-bottom: 12px;">
                        <div class="tooth-card-label" style="font-size: 16px;">🦷 齒位</div>
                        <div class="tooth-number" style="font-size: 18px;">${safeValue(item.toothPosition)}</div>
                    </div>
                    
                    <div class="tooth-card-field" style="margin-bottom: 12px;">
                        <div class="tooth-card-label" style="font-size: 16px;">📦 製作項目</div>
                        <div class="tooth-card-value" style="font-size: 16px;">${safeValue(item.prodItem)}</div>
                    </div>
                </div>

                <div>
                    <div class="tooth-card-field" style="margin-bottom: 12px;">
                        <div class="tooth-card-label" style="font-size: 14px;">🛠️ 產品名稱</div>
                        <div class="tooth-card-value" style="font-size: 16px;">${safeValue(item.prodName)}</div>
                    </div>
                    
                    <div class="tooth-card-field">
                        <div class="tooth-card-label" style="font-size: 14px;">📊 工單現況</div>
                        <div class="tooth-card-value" style="color: #000; font-size: 16px;">
                            ${safeValue(item.workOrderStatus)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        card.innerHTML = cardHTML;
        container.appendChild(card);
    });

    console.log('✅ 所有齒位卡片顯示完成');
}

async function showDetail(workOrderNum) {
    let item = filteredData.find(d => d.workOrderNum === workOrderNum);
    if (!item) item = {};

    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    const accessToken = localStorage.getItem('liffAccessToken');
    const groupId = localStorage.getItem('groupId');

    try {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Doc/workorder/${workOrderNum}?groupId=${groupId}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });

        let detailDataList = [];
        if (response.ok) {
            detailDataList = await response.json();
            console.log('✅ 查詢成功，返回資料筆數:', detailDataList.length);
        } else {
            console.warn(`查詢詳細數據失敗: ${response.status}，使用本地數據`);
            detailDataList = [item];
        }

        const detailItem = detailDataList.length > 0 ? detailDataList[0] : item;
        currentDetailItem = detailItem;

        // 填入基本資訊
        document.getElementById('detailWorkNum').textContent = safeValue(detailItem.workOrderNum);
        document.getElementById('detailClinic').textContent = safeValue(detailItem.clinicName);
        document.getElementById('detailDoctor').textContent = safeValue(detailItem.docName);
        document.getElementById('detailPatient').textContent = safeValue(detailItem.patientName);

        // 顯示齒位卡片
        displayToothPositionCards(detailDataList);

        // 填入日期資訊（只顯示2個日期）
        document.getElementById('detailReceiveDate').textContent = formatDate(detailItem.receivedDate);
        document.getElementById('detailDeliveryDate').textContent = formatDate(detailItem.deliveryDate);

        // 隱藏搜尋區塊
        const searchHeader = document.querySelector('.search-header');
        if (searchHeader) {
            searchHeader.classList.add('hidden');
        }

        // 切換視圖
        document.getElementById('listView').style.display = 'none';
        document.getElementById('detailView').style.display = 'block';

        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

    } catch (error) {
        console.error('查詢詳細數據時發生錯誤:', error);
        showDetailWithLocalData(item);
    }
}

function showDetailWithLocalData(item) {
    currentDetailItem = item;

    document.getElementById('detailWorkNum').textContent = safeValue(item.workOrderNum);
    document.getElementById('detailClinic').textContent = safeValue(item.clinicName);
    document.getElementById('detailDoctor').textContent = safeValue(item.docName);
    document.getElementById('detailPatient').textContent = safeValue(item.patientName);

    displayToothPositionCards([item]);

    document.getElementById('detailReceiveDate').textContent = formatDate(item.receivedDate);
    document.getElementById('detailDeliveryDate').textContent = formatDate(item.deliveryDate);

    const searchHeader = document.querySelector('.search-header');
    if (searchHeader) {
        searchHeader.classList.add('hidden');
    }

    document.getElementById('listView').style.display = 'none';
    document.getElementById('detailView').style.display = 'block';

    window.scrollTo(0, 0);
}

window.displayToothPositionCards = displayToothPositionCards;
window.showDetailWithLocalData = showDetailWithLocalData;

function showList() {
    const searchHeader = document.querySelector('.search-header');
    if (searchHeader) {
        searchHeader.classList.remove('hidden');
    }

    document.getElementById('listView').style.display = 'block';
    document.getElementById('detailView').style.display = 'none';
    currentDetailItem = null;

    setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        document.documentElement.scrollTop = scrollPosition;
        document.body.scrollTop = scrollPosition;
    }, 0);
}

async function initializeData() {
    currentDisplayCount = ITEMS_PER_PAGE;
    const listViewElement = document.getElementById("listView");
    if (!listViewElement) return;

    listViewElement.innerHTML = '<div class="loading">資料載入中...</div>';

    await nldStorage.init();
    await loadAllData();
}

// setPageTitle 函數保持不變
function setPageTitle(clinicName, docName) {
    let title = 'Doctor技工單查詢';

    if (clinicName && docName) {
        title = `${clinicName} -- ${docName}`;
    } else if (clinicName) {
        title = clinicName;
    } else if (docName) {
        title = docName;
    }

    document.title = title;
    console.log('📋 頁面標題已設定為:', title);
}

async function loadUserInfo() {
    const accessToken = localStorage.getItem('liffAccessToken');
    const groupId = localStorage.getItem('groupId');

    if (!accessToken || !groupId) {
        return;
    }

    try {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Doc/userInfo?groupId=${groupId}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (response.ok) {
            const userInfo = await response.json();
            setPageTitle(userInfo.clinicName, userInfo.docName);
            console.log('✅ 使用者資訊載入成功:', userInfo);
        }
    } catch (error) {
        console.error('載入使用者資訊失敗:', error);
    }
}

async function loadAllData() {
    const accessToken = localStorage.getItem('liffAccessToken');
    const groupId = localStorage.getItem('groupId');

    if (!accessToken || !groupId) {
        alert('請重新登入');
        window.location.href = '/route/index.html';
        return;
    }

    const listView = document.getElementById('listView');
    listView.innerHTML = '<div class="loading">資料載入中...</div>';

    try {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Doc/workOrders`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ groupId: groupId })
        });

        console.log('🔍 [DEBUG] Response status:', response.status);
        console.log('🔍 [DEBUG] Response ok:', response.ok);

        if (!response.ok) {
            throw new Error(`載入失敗: ${response.status}`);
        }

        let data = await response.json();
        console.log('🔍 [DEBUG] 原始回應資料:', data);
        console.log('🔍 [DEBUG] 資料類型:', typeof data);
        console.log('🔍 [DEBUG] 是否為陣列:', Array.isArray(data));

        data = deduplicateWorkOrders(data);
        console.log('🔍 [DEBUG] 去重後資料筆數:', data.length);

        originalData = Array.isArray(data) ? data : [];
        filteredData = [...originalData];

        await nldStorage.saveData(data);
        console.log('🔍 [DEBUG] 資料已儲存到 IndexedDB');
        console.log('🔍 [DEBUG] 準備渲染列表...');
        renderListView(filteredData);
        console.log('🔍 [DEBUG] 列表渲染完成');

    } catch (error) {
        console.error('載入資料錯誤:', error);
        listView.innerHTML = '<div class="loading" style="color: red;">資料載入失敗</div>';
    }
}

async function performSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    const dateType = document.getElementById('dateTypeSelect').value;
    const startDate = document.getElementById('startDate').value;

    const hasDateInput = dateType || startDate;

    if (hasDateInput) {
        if (!dateType) {
            alert('請選擇日期類型');
            return;
        }
        if (!startDate) {
            alert('請選擇開始日期');
            return;
        }
    }

    if (!keyword && !hasDateInput) {
        alert('請至少輸入一個搜尋條件（關鍵字或日期）');
        return;
    }

    const accessToken = localStorage.getItem('liffAccessToken');
    const groupId = localStorage.getItem('groupId');

    if (!accessToken || !groupId) {
        alert('請重新登入');
        window.location.href = '/route/index.html';
        return;
    }

    const listView = document.getElementById('listView');
    listView.innerHTML = '<div class="loading">🔍 搜尋中...</div>';

    try {
        const params = new URLSearchParams();
        params.append('groupId', groupId);

        if (keyword) params.append('keyword', keyword);
        if (dateType) params.append('dateType', dateType);
        if (startDate) params.append('startDate', startDate);

        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Doc/search?${params.toString()}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            throw new Error(`搜尋失敗: ${response.status}`);
        }

        let data = await response.json();
        data = deduplicateWorkOrders(data);

        originalData = Array.isArray(data) ? data : [];
        filteredData = [...originalData];

        await nldStorage.saveData(data);
        renderListView(filteredData);

    } catch (error) {
        console.error('搜尋錯誤:', error);
        listView.innerHTML = '<div class="loading" style="color: red;">搜尋失敗,請重試</div>';
    }
}

function clearAndSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('dateTypeSelect').value = '';
    document.getElementById('startDate').value = '';
    loadAllData();
}

window.addEventListener("DOMContentLoaded", async () => {
    await nldStorage.clearData();
    console.log("🧹 已清空舊快取，將重新載入最新資料");

    // ✅ 先載入使用者資訊設定標題
    await loadUserInfo();

    await initializeData();

    // 滾動時顯示/隱藏搜尋框
    let lastScrollTop = 0;
    let scrollTimeout;
    const searchHeader = document.querySelector('.search-header');
    const scrollThreshold = 10;

    window.addEventListener('scroll', function() {
        const listView = document.getElementById('listView');
        const isListPage = listView && listView.style.display !== 'none';

        if (!isListPage || !searchHeader) return;

        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScrollTop <= 0) {
                searchHeader.classList.remove('hidden');
                lastScrollTop = currentScrollTop;
                return;
            }

            if (currentScrollTop > lastScrollTop + scrollThreshold) {
                searchHeader.classList.add('hidden');
            } else if (currentScrollTop < lastScrollTop - scrollThreshold) {
                searchHeader.classList.remove('hidden');
            }

            lastScrollTop = currentScrollTop;
        }, 50);
    }, { passive: true });

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearAndSearch);
    }

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (document.getElementById('detailView').style.display === 'block') {
                showList();
            } else {
                window.location.href = '/route/index.html';
            }
        });
    }

    window.refreshData = function() {
        initializeData();
    };
});

window.showDetail = showDetail;
window.loadMoreItems = loadMoreItems;