// ===== 🚫 統一的瀏覽器返回阻止機制 =====
(function() {
    'use strict';

    console.log('🔧 初始化返回阻止機制...');

    let touchStartX = 0;
    let touchStartY = 0;

    // 1. 禁用左邊緣向右滑動手勢
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

    // 2. 阻止 popstate（瀏覽器返回鍵）
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

    // 3. 頁面可見性變化檢測
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            window.history.pushState(null, '', window.location.href);
            console.log('👁️ 頁面重新可見，重新推入歷史');
        }
    });

    console.log('✅ 返回阻止機制已啟用');
})();

let scrollPosition = 0;

// ✅ 簡易 Debug Viewer (手機用)
function debug(msg) {
    try {
        const logDiv = document.getElementById("debugLog");
        if (!logDiv) return;

        const time = new Date().toLocaleTimeString();
        logDiv.style.display = "block";
        logDiv.innerHTML += `<div>[${time}] ${msg}</div>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    } catch (e) {
        console.log("Debug error:", e);
    }
}

/**
 * 新增備註到後端（不覆蓋原有備註）
 */
async function addNewRemark() {
    try {
        const newRemarkInput = document.getElementById('newRemarkInput');
        const newRemarkText = newRemarkInput.value.trim();

        if (!newRemarkText) {
            alert('請輸入備註內容！');
            return;
        }

        // ✅ 添加確認提示
        const confirmMessage = `確定要新增以下備註嗎？\n\n${newRemarkText}`;
        if (!confirm(confirmMessage)) {
            console.log('❌ 使用者取消新增備註');
            return;
        }

        // ✅ 只從 localStorage 獲取 lineDisplayName
        let lineUserName = localStorage.getItem('lineDisplayName') || '未命名';

        console.log('👤 從 localStorage 獲取的名稱:', lineUserName);

        // ✅ 處理用戶名稱長度
        if (lineUserName !== '未命名') {
            if (/[\u4e00-\u9fa5]/.test(lineUserName)) {
                lineUserName = lineUserName.substring(0, 3);
            } else {
                lineUserName = lineUserName.substring(0, 6);
            }
        }

        console.log('👤 最終使用的用戶名稱:', lineUserName);

        // ✅ 時間格式：[月/日 時:分]（24小時制，帶方括號）
        const now = new Date();
        const month = String(now.getMonth() + 1);
        const day = String(now.getDate());
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedTime = `[${month}/${day} ${hours}:${minutes}]`;

        // === 取得現有備註 ===
        const existingRemarks = safeRemarksValue(currentDetailItem.remarks);

        // === 合併新備註
        const newRemark = `${lineUserName}：${newRemarkText} ${formattedTime}`;
        const combinedRemarks = existingRemarks
            ? `${newRemark}\n${existingRemarks}`
            : newRemark;

        console.log('📝 準備提交的備註:', combinedRemarks);

        // === 呼叫後端 API 更新備註 ===
        const accessToken = localStorage.getItem('liffAccessToken');
        const groupId = localStorage.getItem('groupId');

        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Sales/workorder/${currentDetailItem.workOrderNum}/remarks`;

        console.log('🌐 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                groupId: groupId,
                remarks: combinedRemarks
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API 錯誤響應:', errorText);
            throw new Error(`HTTP 錯誤：${response.status}`);
        }

        const result = await response.json();
        console.log('✅ API 響應:', result);

        // === 成功後更新本地數據 ===
        currentDetailItem.remarks = combinedRemarks;

        // ✅ 立即更新 UI 顯示
        const existingRemarksDiv = document.getElementById('existingRemarks');
        if (existingRemarksDiv) {
            existingRemarksDiv.innerHTML = combinedRemarks.replace(/\n/g, '<br>');
            existingRemarksDiv.style.color = '#333';
        }

        // 更新本地存儲
        const allData = await nldStorage.getData();
        if (allData && Array.isArray(allData)) {
            const updatedData = allData.map(item => {
                if (item.workOrderNum === currentDetailItem.workOrderNum) {
                    return { ...item, remarks: combinedRemarks };
                }
                return item;
            });
            await nldStorage.saveData(updatedData);
            console.log('📦 IndexedDB 備註同步完成');
        }

        // === 清空輸入框 ===
        newRemarkInput.value = '';
        showSuccessMessage('✅ 備註新增成功！');

    } catch (error) {
        console.error('⚠️ 新增備註失敗:', error);
        alert('備註新增失敗，請稍後再試\n錯誤: ' + error.message);
    }
}

// 暴露到全域
window.addNewRemark = addNewRemark;

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
            price: item.price,
            prodItem: item.prodItem,
            prodName: item.prodName ? String(item.prodName).substring(0, 100) : null,
            receivedDate: item.receivedDate,
            estFinishDate: item.estFinishDate,
            tryInDate: item.tryInDate,
            deliveryDate: item.deliveryDate,
            tryInReceivedDate: item.tryInReceivedDate,
            estTryInDate: item.estTryInDate,
            workOrderStatus: item.workOrderStatus,
            isRemake: item.isRemake,
            isNoCharge: item.isNoCharge,
            isPaused: item.isPaused,
            isVoided: item.isVoided,
            remarks: item.remarks ? String(item.remarks).substring(0, 200) : null
        })).filter(item => item.workOrderNum);
    }
}

const nldStorage = new NLDStorage();

function deduplicateWorkOrders(data) {
    const seen = new Set();
    return data.filter(item => {
        if (seen.has(item.workOrderNum)) {
            return false;
        }
        seen.add(item.workOrderNum);
        return true;
    });
}

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

window.emergencyCleanup = emergencyCleanup;

window.addEventListener('beforeunload', function(e) {});

// 全局變數
let originalData = [];
let filteredData = [];
let currentDetailItem = null;
let currentCalendarYear = new Date().getFullYear();
let currentCalendarMonth = new Date().getMonth();

// 格式化日期顯示
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

function formatDateForCalendar(dateInput) {
    if (!dateInput) return null;

    let date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        return null;
    }

    if (isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

function generateStatusTags(item) {
    const tags = [];
    if (item.isRemake) tags.push('<span class="status-tag status-remake">重製</span>');
    if (item.isNoCharge) tags.push('<span class="status-tag status-nocharge">不計價</span>');
    if (item.isPaused) tags.push('<span class="status-tag status-pause">暫停</span>');
    if (item.isVoided) tags.push('<span class="status-tag status-void">作廢</span>');
    return tags.join('');
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
                    <div class="label">醫師</div>
                    <div class="value">${safeValue(item.docName)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">預計完成日</div>
                    <div class="value">${formatDateWithTimeSlot(item.estFinishDate, item.tim3Dh)}</div>
                </div>
            </div>
        </div>
    `;
}

const ITEMS_PER_PAGE = 50;
let currentDisplayCount = ITEMS_PER_PAGE;

function renderListView(dataList) {
    const listView = document.getElementById('listView');

    if (!dataList || dataList.length === 0) {
        listView.innerHTML = '<div class="loading">查無資料</div>';
        return;
    }

    const itemsToShow = dataList.slice(0, currentDisplayCount);
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
 * ✅ 費用區塊插入函數 - 開眼👀 閉眼🔒
 */
function insertFeeBlockBeforeDateInfo(detailDataList) {
    const existingFeeBlock = document.getElementById('feeBlockSection');
    if (existingFeeBlock) {
        existingFeeBlock.remove();
    }

    const detailContent = document.querySelector('.detail-content');
    if (!detailContent) {
        console.error('❌ 找不到 detail-content 元素');
        return;
    }

    console.log('📊 準備計算費用...');

    const totalAmount = detailDataList.length > 0 ? detailDataList[0].totalAmount : null;

    const feeBlock = document.createElement('div');
    feeBlock.id = 'feeBlockSection';
    feeBlock.className = 'detail-section';
    feeBlock.style.marginBottom = '24px';

    const displayTotalAmount = totalAmount !== null && totalAmount !== undefined ?
        totalAmount : 0;

    const totalAmountInt = Math.round(displayTotalAmount);

    const totalAmountToggleId = `totalAmountToggle_${Date.now()}`;

    feeBlock.innerHTML = `
    <div class="detail-field">
        <div class="field-label">💳 工單總金額</div>
        <div class="field-value" style="display: flex; align-items: center; gap: 8px;">
            <span id="${totalAmountToggleId}_masked">●●●●●●</span>
            <span id="${totalAmountToggleId}_value" style="display: none;">$${totalAmountInt.toLocaleString('zh-TW')}</span>
            <button id="${totalAmountToggleId}_btn" 
                    style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 0; color: #666;" 
                    title="顯示/隱藏金額">👀</button>
        </div>
    </div>
`;

    console.log('✅ 費用區塊HTML已創建');

    const allSections = detailContent.querySelectorAll('.detail-section');
    console.log('🔍 找到的 section 數量:', allSections.length);

    if (allSections.length >= 2) {
        const dateSection = allSections[1];
        console.log('✅ 在日期資訊前插入費用區塊');
        dateSection.parentNode.insertBefore(feeBlock, dateSection);
        console.log('✅ 費用區塊插入成功！');
    } else {
        console.warn('⚠️ 找不到日期資訊區塊，將費用區塊追加到末尾');
        detailContent.appendChild(feeBlock);
    }

    setTimeout(() => {
        setupToggleButtons(totalAmountToggleId);
    }, 100);
}

/**
 * 設置顯示/隱藏按鈕事件 - 開眼👀 閉眼🔒
 */
function setupToggleButtons(totalAmountToggleId) {
    const totalAmountBtn = document.getElementById(`${totalAmountToggleId}_btn`);
    if (totalAmountBtn) {
        totalAmountBtn.addEventListener('click', function() {
            const masked = document.getElementById(`${totalAmountToggleId}_masked`);
            const value = document.getElementById(`${totalAmountToggleId}_value`);

            if (masked.style.display === 'none') {
                masked.style.display = 'inline';
                value.style.display = 'none';
                this.textContent = '👀';
            } else {
                masked.style.display = 'none';
                value.style.display = 'inline';
                this.textContent = '🔒';
            }
        });
    }

    console.log('✅ 眼睛按鈕事件綁定成功！');
}

window.insertFeeBlockBeforeDateInfo = insertFeeBlockBeforeDateInfo;
window.setupToggleButtons = setupToggleButtons;

function findEarliestDate(item) {
    if (!item) {
        return null;
    }

    const dates = [
        { date: item.receivedDate, name: '收模日' },
        { date: item.deliveryDate, name: '完成交件日' },
        { date: item.tryInDate, name: '試戴交件日' },
        { date: item.tryInReceivedDate, name: '試戴收件日' }
    ].filter(d => d.date)
        .map(d => {
            let parsedDate;
            try {
                if (typeof d.date === 'string') {
                    parsedDate = new Date(d.date);
                } else if (typeof d.date === 'number') {
                    parsedDate = new Date(d.date);
                } else if (d.date instanceof Date) {
                    parsedDate = d.date;
                } else {
                    return null;
                }

                return isNaN(parsedDate.getTime()) ? null : {
                    date: parsedDate,
                    name: d.name
                };
            } catch (e) {
                console.error("日期解析錯誤:", d, e);
                return null;
            }
        }).filter(Boolean);

    if (dates.length === 0) {
        return null;
    }

    const earliest = dates.reduce((prev, current) =>
        prev.date < current.date ? prev : current
    );

    return earliest.date;
}

function safeRemarksValue(value) {
    return (value === null || value === undefined || value === "NULL" || value === "-") ? '' : value;
}

async function showDetail(workOrderNum) {
    let item = filteredData.find(d => d.workOrderNum === workOrderNum);
    if (!item) item = {};

    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // ✅ 從後端查詢完整數據（包含所有齒位）
    const accessToken = localStorage.getItem('liffAccessToken');
    const groupId = localStorage.getItem('groupId');

    try {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Sales/workorder/${workOrderNum}?groupId=${groupId}`;

        console.log('📤 查詢詳細資料:', apiUrl);

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

        // ===== 填入基本資訊 =====
        document.getElementById('detailWorkNum').textContent = safeValue(detailItem.workOrderNum);
        document.getElementById('detailClinic').textContent = safeValue(detailItem.clinicName);
        document.getElementById('detailDoctor').textContent = safeValue(detailItem.docName);
        document.getElementById('detailPatient').textContent = safeValue(detailItem.patientName);

        // ✅ 顯示所有齒位的詳細卡片
        displayToothPositionCards(detailDataList);

        insertFeeBlockBeforeDateInfo(detailDataList);

        // ===== 填入日期資訊 =====
        document.getElementById('detailReceiveDate').textContent = formatDate(detailItem.receivedDate);
        document.getElementById('detailExpectedDate').textContent = formatFullDateWithTimeSlot(detailItem.estFinishDate, detailItem.tim3Dh);
        document.getElementById('detailTryInDate').textContent = formatFullDateWithTimeSlot(detailItem.tryInDate, detailItem.tim2Dh);
        document.getElementById('detailDeliveryDate').textContent = formatDate(detailItem.deliveryDate);
        document.getElementById('detailTryReceiveDate').textContent = formatDate(detailItem.tryInReceivedDate);
        document.getElementById('detailExpectedTryDate').textContent = formatDate(detailItem.estTryInDate);

        // ===== 填入狀態資訊 =====
        const statusTags = formatStatusLabels(detailItem.statusLabels || '-');
        document.getElementById('detailTags').textContent = statusTags;

        const existingRemarksDiv = document.getElementById('existingRemarks');
        if (existingRemarksDiv) {
            const remarks = safeRemarksValue(detailItem.remarks);
            if (remarks) {
                existingRemarksDiv.innerHTML = remarks.replace(/\n/g, '<br>');
                existingRemarksDiv.style.color = '#333';
            } else {
                existingRemarksDiv.innerHTML = '<span style="color:#999;">暫無備註</span>';
            }
        }

        // 隱藏搜尋區塊
        const searchHeader = document.querySelector('.search-header');
        if (searchHeader) {
            searchHeader.classList.add('hidden');
        }

        // 切換視圖
        document.getElementById('listView').style.display = 'none';
        document.getElementById('detailView').style.display = 'block';

        const floatingButtons = document.querySelector('.floating-buttons');
        if (floatingButtons) {
            floatingButtons.style.display = 'flex';
        }

        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        // ✅ 延遲載入圖片
        setTimeout(() => {
            if (typeof loadWorkOrderImages === 'function') {
                loadWorkOrderImages(workOrderNum);
            } else {
                console.error('loadWorkOrderImages 函數不存在');
            }
        }, 100);

    } catch (error) {
        console.error('查詢詳細數據時發生錯誤:', error);
        showDetailWithLocalData(item);
    }
}

/**
 * ✅ 顯示齒位詳細卡片 - 單價加密顯示
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

        const priceToggleId = `priceToggle_${item.toothPosition}_${index}_${Date.now()}`;

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
                    
                    <div class="tooth-card-field">
                        <div class="tooth-card-label" style="font-size: 16px;">💰 單價</div>
                        <div class="tooth-card-value" style="display: flex; align-items: center; gap: 6px; font-size: 16px;">
                            <span>
                                <span id="${priceToggleId}_masked">●●●●●●</span>
                                <span id="${priceToggleId}_value" style="display: none;">$${item.price ? item.price.toLocaleString() : '-'}</span>
                            </span>
                            <button id="${priceToggleId}_btn" 
                                    style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0; color: #666; margin-top: 2px;" 
                                    title="顯示/隱藏金額">👀</button>
                        </div>
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

        setTimeout(() => {
            const priceBtn = document.getElementById(`${priceToggleId}_btn`);
            if (priceBtn) {
                priceBtn.addEventListener('click', function() {
                    const masked = document.getElementById(`${priceToggleId}_masked`);
                    const value = document.getElementById(`${priceToggleId}_value`);

                    if (masked.style.display === 'none') {
                        masked.style.display = 'inline';
                        value.style.display = 'none';
                        this.textContent = '👀';
                    } else {
                        masked.style.display = 'none';
                        value.style.display = 'inline';
                        this.textContent = '🔒';
                    }
                });
            }
        }, 50);
    });

    console.log('✅ 所有齒位卡片顯示完成');
}

/**
 * 使用本地數據顯示詳細信息
 */
function showDetailWithLocalData(item) {
    currentDetailItem = item;

    document.getElementById('detailWorkNum').textContent = safeValue(item.workOrderNum);
    document.getElementById('detailClinic').textContent = safeValue(item.clinicName);
    document.getElementById('detailDoctor').textContent = safeValue(item.docName);
    document.getElementById('detailPatient').textContent = safeValue(item.patientName);

    displayToothPositionCards([item]);

    document.getElementById('detailReceiveDate').textContent = formatDate(item.receivedDate);
    document.getElementById('detailDeliveryDate').textContent = formatDate(item.deliveryDate);
    document.getElementById('detailTryReceiveDate').textContent = formatDate(item.tryInReceivedDate);
    document.getElementById('detailExpectedTryDate').textContent = formatDate(item.estTryInDate);
    document.getElementById('detailExpectedDate').textContent = formatFullDateWithTimeSlot(item.estFinishDate, item.tim3Dh);
    document.getElementById('detailTryInDate').textContent = formatFullDateWithTimeSlot(item.tryInDate, item.tim2Dh);

    const statusTags = formatStatusLabels(item.statusLabels || '-');
    document.getElementById('detailTags').textContent = statusTags;

    const existingRemarksDiv = document.getElementById('existingRemarks');
    if (existingRemarksDiv) {
        const remarks = safeRemarksValue(item.remarks);
        if (remarks) {
            existingRemarksDiv.innerHTML = remarks.replace(/\n/g, '<br>');
            existingRemarksDiv.style.color = '#333';
        } else {
            existingRemarksDiv.innerHTML = '<span style="color: #999;">暫無備註</span>';
        }
    }

    const newRemarkInput = document.getElementById('newRemarkInput');
    if (newRemarkInput) {
        newRemarkInput.value = '';
    }

    const searchHeader = document.querySelector('.search-header');
    if (searchHeader) {
        searchHeader.classList.add('hidden');
    }

    document.getElementById('listView').style.display = 'none';
    document.getElementById('detailView').style.display = 'block';

    window.scrollTo(0, 0);

    setTimeout(() => {
        if (typeof loadWorkOrderImages === 'function') {
            loadWorkOrderImages(item.workOrderNum);
        }
    }, 100);
}

window.displayToothPositionCards = displayToothPositionCards;
window.showDetailWithLocalData = showDetailWithLocalData;

function setupFloatingButtonsVisibility() {
    const floatingButtons = document.querySelector('.floating-buttons');

    if (!floatingButtons) {
        console.warn('找不到浮動按鈕元素');
        return;
    }

    const observer = new MutationObserver(() => {
        const detailView = document.getElementById('detailView');
        const isDetailPage = detailView && detailView.style.display === 'block';

        if (isDetailPage) {
            floatingButtons.style.display = 'flex';
        } else {
            floatingButtons.style.display = 'none';
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setTimeout(() => {
        const detailView = document.getElementById('detailView');
        const isDetailPage = detailView && detailView.style.display === 'block';
        floatingButtons.style.display = isDetailPage ? 'flex' : 'none';
    }, 0);
}

window.setupFloatingButtonsVisibility = setupFloatingButtonsVisibility;

document.addEventListener('DOMContentLoaded', setupFloatingButtonsVisibility);

function showList() {
    const searchHeader = document.querySelector('.search-header');
    if (searchHeader) {
        searchHeader.classList.remove('hidden');
    }

    document.getElementById('listView').style.display = 'block';
    document.getElementById('detailView').style.display = 'none';
    document.getElementById('calendarView').style.display = 'none';
    currentDetailItem = null;

    const floatingButtons = document.querySelector('.floating-buttons');
    if (floatingButtons) {
        floatingButtons.style.display = 'none';
    }

    setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        document.documentElement.scrollTop = scrollPosition;
        document.body.scrollTop = scrollPosition;
    }, 0);
}

function showCalendar() {
    if (!currentDetailItem) {
        alert("請先選擇一筆工單");
        return;
    }

    try {
        const earliestDate = findEarliestDate(currentDetailItem);

        if (earliestDate && earliestDate instanceof Date && !isNaN(earliestDate.getTime())) {
            currentCalendarYear = earliestDate.getFullYear();
            currentCalendarMonth = earliestDate.getMonth();
        } else {
            const now = new Date();
            currentCalendarYear = now.getFullYear();
            currentCalendarMonth = now.getMonth();
        }

        const titleElement = document.getElementById('calendarTitle');
        const calendarViewElement = document.getElementById('calendarView');

        if (!titleElement || !calendarViewElement) {
            console.error("找不到日曆相關DOM元素");
            return;
        }

        titleElement.textContent = `${currentCalendarYear}年${currentCalendarMonth + 1}月`;
        generateCalendar(currentCalendarYear, currentCalendarMonth, currentDetailItem);
        calendarViewElement.style.display = 'block';

    } catch (error) {
        console.error("顯示日曆時發生錯誤:", error);
        alert("日曆功能發生錯誤，請重新嘗試");
    }
}

function navigateCalendar(direction) {
    if (!currentDetailItem) return;

    switch(direction) {
        case 'prevYear':
            currentCalendarYear--;
            break;
        case 'nextYear':
            currentCalendarYear++;
            break;
        case 'prevMonth':
            currentCalendarMonth--;
            if (currentCalendarMonth < 0) {
                currentCalendarMonth = 11;
                currentCalendarYear--;
            }
            break;
        case 'nextMonth':
            currentCalendarMonth++;
            if (currentCalendarMonth > 11) {
                currentCalendarMonth = 0;
                currentCalendarYear++;
            }
            break;
    }

    document.getElementById('calendarTitle').textContent = `${currentCalendarYear}年${currentCalendarMonth + 1}月`;
    generateCalendar(currentCalendarYear, currentCalendarMonth, currentDetailItem);
}

function generateCalendar(year, month, item) {
    const grid = document.getElementById('calendarGrid');
    const dayHeaders = grid.querySelectorAll('.calendar-day-header');
    grid.innerHTML = '';
    dayHeaders.forEach(header => grid.appendChild(header));

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = firstDay.getDay();

    const receivedDateStr = formatDateForCalendar(item.receivedDate);
    const deliveryDateStr = formatDateForCalendar(item.deliveryDate);
    const tryInDateStr = formatDateForCalendar(item.tryInDate);
    const tryReceiveDateStr = formatDateForCalendar(item.tryInReceivedDate);

    const legendData = {
        received: receivedDateStr ? formatFullDate(item.receivedDate) : null,
        delivery: deliveryDateStr ? formatFullDate(item.deliveryDate) : null,
        tryIn: tryInDateStr ? formatFullDate(item.tryInDate) : null,
        tryReceive: tryReceiveDateStr ? formatFullDate(item.tryInReceivedDate) : null
    };

    for (let i = 0; i < startDate; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        grid.appendChild(emptyDay);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (receivedDateStr === currentDateStr) {
            dayElement.classList.add('receive-date');
            dayElement.title = '收件日';
        } else if (deliveryDateStr === currentDateStr) {
            dayElement.classList.add('delivery-date');
            dayElement.title = '完成交件日';
        } else if (tryInDateStr === currentDateStr) {
            dayElement.classList.add('try-in-date');
            dayElement.title = '試戴交件日';
        } else if (tryReceiveDateStr === currentDateStr) {
            dayElement.classList.add('try-receive-date');
            dayElement.title = '試戴收件日';
        }

        grid.appendChild(dayElement);
    }

    generateCalendarLegend(legendData);
}

function generateCalendarLegend(legendData) {
    const legendContainer = document.querySelector('.calendar-legend');
    if (!legendContainer) return;

    const legendItems = [];

    if (legendData.received) {
        legendItems.push({
            color: '#ff9800',
            label: '收件日',
            date: legendData.received,
            rawDate: currentDetailItem.receivedDate
        });
    }

    if (legendData.delivery) {
        legendItems.push({
            color: '#4caf50',
            label: '完成交件日',
            date: legendData.delivery,
            rawDate: currentDetailItem.deliveryDate
        });
    }

    if (legendData.tryIn) {
        legendItems.push({
            color: '#2196f3',
            label: '試戴交件日',
            date: legendData.tryIn,
            rawDate: currentDetailItem.tryInDate
        });
    }

    if (legendData.tryReceive) {
        legendItems.push({
            color: '#9c27b0',
            label: '試戴收件日',
            date: legendData.tryReceive,
            rawDate: currentDetailItem.tryInReceivedDate
        });
    }

    legendContainer.innerHTML = legendItems.map((item, index) => `
        <div class="legend-item">
            <div class="legend-color clickable-legend" 
                 style="background-color: ${item.color}; cursor: pointer;" 
                 onclick="jumpToDateMonth('${item.rawDate}')"
                 title="點擊跳轉到該月份"></div>
            <span>${item.label}${item.date ? `(${item.date})` : ''}</span>
        </div>
    `).join('');
}

function jumpToDateMonth(dateInput) {
    if (!dateInput || !currentDetailItem) return;

    let targetDate;
    try {
        if (typeof dateInput === 'string') {
            targetDate = new Date(dateInput);
        } else if (typeof dateInput === 'number') {
            targetDate = new Date(dateInput);
        } else if (dateInput instanceof Date) {
            targetDate = dateInput;
        } else {
            return;
        }

        if (isNaN(targetDate.getTime())) {
            return;
        }

        currentCalendarYear = targetDate.getFullYear();
        currentCalendarMonth = targetDate.getMonth();

        document.getElementById('calendarTitle').textContent = `${currentCalendarYear}年${currentCalendarMonth + 1}月`;
        generateCalendar(currentCalendarYear, currentCalendarMonth, currentDetailItem);

    } catch (error) {
        console.error("跳轉日期時發生錯誤:", error);
    }
}

async function initializeData() {
    currentDisplayCount = ITEMS_PER_PAGE;
    const listViewElement = document.getElementById("listView");
    if (!listViewElement) return;

    listViewElement.innerHTML = '<div class="loading">資料載入中...</div>';

    await nldStorage.init();

    await loadAllData();
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
        const apiUrl = `${protocol}//${host}/NLD/sales/workOrders`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ groupId: groupId })
        });

        if (!response.ok) {
            throw new Error(`載入失敗: ${response.status}`);
        }

        let data = await response.json();
        data = deduplicateWorkOrders(data);

        originalData = Array.isArray(data) ? data : [];
        filteredData = [...originalData];

        await nldStorage.saveData(data);
        renderListView(filteredData);

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
        const apiUrl = `${protocol}//${host}/NLD/Sales/search?${params.toString()}`;

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

    await initializeData();

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

    if (typeof setupFloatingButtonsVisibility === 'function') {
        setupFloatingButtonsVisibility();
    }

    const listView = document.getElementById('listView');
    const searchInput = document.getElementById('searchInput');
    const backBtn = document.getElementById('backBtn');

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

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

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (document.getElementById('detailView').style.display === 'block') {
                showList();
            } else {
                window.location.href = '/route/index.html';
            }
        });
    }

    // ✅ 拍照浮動按鈕
    const cameraFloatBtn = document.getElementById('cameraFloatBtn');
    const cameraInput = document.getElementById('cameraInput');

    if (cameraFloatBtn && cameraInput) {
        cameraFloatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!currentDetailItem?.workOrderNum) {
                alert('⚠️ 請先選擇工單再拍照');
                return;
            }

            setTimeout(() => {
                cameraInput.click();
            }, 100);
        });

        cameraFloatBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!currentDetailItem?.workOrderNum) {
                alert('⚠️ 請先選擇工單再拍照');
                return;
            }

            setTimeout(() => {
                cameraInput.click();
            }, 100);
        }, { passive: false });
    }

    if (cameraInput) {
        cameraInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                await handleImageCapture(e);
            }
        });
    }

    const calendarBtn = document.getElementById('calendarBtn');
    if (calendarBtn) {
        let touchHandled = false;

        calendarBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchHandled = true;
            showCalendar();
        });

        calendarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!touchHandled) {
                showCalendar();
            }
            touchHandled = false;
        });
    }

    const calendarClose = document.getElementById('calendarClose');
    if (calendarClose) {
        let touchHandled = false;

        calendarClose.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchHandled = true;
            document.getElementById('calendarView').style.display = 'none';
        });

        calendarClose.addEventListener('click', (e) => {
            e.preventDefault();
            if (!touchHandled) {
                document.getElementById('calendarView').style.display = 'none';
            }
            touchHandled = false;
        });
    }

    function addNavigationListener(element, direction) {
        if (!element) return;

        let touchHandled = false;

        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchHandled = true;
            navigateCalendar(direction);
        });

        element.addEventListener('click', (e) => {
            e.preventDefault();
            if (!touchHandled) {
                navigateCalendar(direction);
            }
            touchHandled = false;
        });
    }

    const prevYear = document.getElementById('prevYear');
    const nextYear = document.getElementById('nextYear');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');

    addNavigationListener(prevYear, 'prevYear');
    addNavigationListener(nextYear, 'nextYear');
    addNavigationListener(prevMonth, 'prevMonth');
    addNavigationListener(nextMonth, 'nextMonth');

    const calendarView = document.getElementById('calendarView');
    if (calendarView) {
        calendarView.addEventListener('click', function(e) {
            if (window.innerWidth >= 768) {
                if (e.target === calendarView) {
                    calendarView.style.display = 'none';
                }
            }
        });

        const calendarHeader = document.querySelector('.calendar-header');
        const calendarContent = document.querySelector('.calendar-content');

        if (calendarHeader) {
            calendarHeader.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        if (calendarContent) {
            calendarContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }

    window.refreshData = function() {
        initializeData();
    };
});

window.showDetail = showDetail;
window.jumpToDateMonth = jumpToDateMonth;
window.loadMoreItems = loadMoreItems;

// ============================================
// 完整版圖片載入函數
// ============================================

async function loadWorkOrderImages(workOrderNum) {
    const imageContainer = document.getElementById('imageContainer');

    if (!imageContainer) {
        console.error('找不到 imageContainer 元素');
        return;
    }

    imageContainer.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; padding:20px; color:#999;">
            <div style="text-align:center;">
                <div style="font-size:24px; margin-bottom:10px;">⏳</div>
                <div>載入圖片中...</div>
            </div>
        </div>
    `;

    try {
        const apiUrl = `https://line.nldlab.com/api/scaner/${workOrderNum}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const imageUrls = await response.json();

        if (!imageUrls || imageUrls.length === 0) {
            imageContainer.innerHTML = `
                <div style="
                    display: flex; 
                    align-items: flex-start; 
                    justify-content: center; 
                    padding: 20px 15px;
                    padding-bottom: 80px;
                    min-height: 120px;
                ">
                    <div style="text-align: center;">
                        <div style="
                            font-size: 36px; 
                            margin-bottom: 8px; 
                            color: #f44336;
                            font-weight: bold;
                            line-height: 1;
                        ">✕</div>
                        <div style="
                            font-size: 14px; 
                            color: #666; 
                            font-weight: 500;
                            white-space: nowrap;
                        ">無圖片</div>
                    </div>
                </div>
            `;
            return;
        }

        imageContainer.innerHTML = '';
        imageContainer.style.cssText = `
            display: flex; 
            flex-wrap: wrap; 
            gap: 12px; 
            padding: 15px; 
            padding-bottom: 80px;
            background: #f9f9f9; 
            border-radius: 8px;
        `;

        imageUrls.forEach((url, index) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.style.cssText = `
                position: relative;
                width: 150px;
                height: 150px;
                border-radius: 12px;
                overflow: hidden;
                background: #e0e0e0;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            `;

            const clickHint = document.createElement('div');
            clickHint.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0,0,0,0.6);
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                display: none;
                z-index: 10;
            `;
            clickHint.textContent = '點擊放大';
            imgWrapper.appendChild(clickHint);

            imgWrapper.onmouseover = () => {
                imgWrapper.style.transform = 'scale(1.05)';
                imgWrapper.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
                clickHint.style.display = 'block';
            };
            imgWrapper.onmouseout = () => {
                imgWrapper.style.transform = 'scale(1)';
                imgWrapper.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                clickHint.style.display = 'none';
            };

            imgWrapper.ontouchstart = () => {
                imgWrapper.style.transform = 'scale(0.95)';
            };
            imgWrapper.ontouchend = () => {
                imgWrapper.style.transform = 'scale(1)';
            };

            imgWrapper.innerHTML += '<div style="color:#999; font-size:12px;">載入中...</div>';

            const img = new Image();

            let fullImageUrl;
            if (url.startsWith('http://') || url.startsWith('https://')) {
                fullImageUrl = url;
            } else if (url.startsWith('/')) {
                fullImageUrl = `https://line.nldlab.com${url}`;
            } else {
                fullImageUrl = `https://line.nldlab.com/${url}`;
            }

            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;

            img.onload = function() {
                const loadingText = imgWrapper.querySelector('div:not([style*="position: absolute"])');
                if (loadingText) {
                    loadingText.remove();
                }
                imgWrapper.appendChild(img);
            };

            img.onerror = function() {
                imgWrapper.innerHTML = `
                    <div style="text-align:center; color:#f44336;">
                        <div style="font-size:32px; margin-bottom:5px;">❌</div>
                        <div style="font-size:11px;">載入失敗</div>
                    </div>
                `;
            };

            imgWrapper.onclick = function(e) {
                e.preventDefault();

                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.95);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: zoom-out;
                    animation: fadeIn 0.2s;
                `;

                const previewImg = document.createElement('img');
                previewImg.src = fullImageUrl;
                previewImg.style.cssText = `
                    max-width: 95%;
                    max-height: 95%;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                `;

                const closeBtn = document.createElement('div');
                closeBtn.innerHTML = '✕';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background: rgba(255,255,255,0.9);
                    color: #333;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    cursor: pointer;
                    font-weight: bold;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                `;

                overlay.appendChild(previewImg);
                overlay.appendChild(closeBtn);
                document.body.appendChild(overlay);

                overlay.onclick = function(e) {
                    if (e.target === overlay || e.target === closeBtn) {
                        overlay.style.animation = 'fadeOut 0.2s';
                        setTimeout(() => overlay.remove(), 200);
                    }
                };
            };

            img.src = fullImageUrl;

            imageContainer.appendChild(imgWrapper);
        });

    } catch (error) {
        console.error('載入圖片錯誤:', error);
        imageContainer.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; padding:30px; color:#f44336;">
                <div style="text-align:center; max-width:300px;">
                    <div style="font-size:48px; margin-bottom:15px;">⚠️</div>
                    <div style="font-weight:bold; margin-bottom:8px; font-size:16px;">載入失敗</div>
                    <div style="font-size:13px; color:#666;">
                        ${error.message || '無法載入圖片,請稍後再試'}
                    </div>
                </div>
            </div>
        `;
    }
}

if (!document.getElementById('imageLoaderStyles')) {
    const style = document.createElement('style');
    style.id = 'imageLoaderStyles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// 拍照上傳功能
// ============================================

function openCamera() {
    if (!currentDetailItem || !currentDetailItem.workOrderNum) {
        alert('❌ 請先選擇一筆工單');
        return;
    }

    const input = document.getElementById('cameraInput');
    if (input) {
        input.click();
    } else {
        console.error('找不到 cameraInput 元素');
    }
}

async function handleImageCapture(event) {
    const files = event.target.files;

    if (!files || files.length === 0) {
        debug("❌ No files captured");
        return;
    }

    if (!currentDetailItem?.workOrderNum) {
        alert("⚠️ 請先選擇工單再上傳照片");
        event.target.value = "";
        return;
    }

    try {
        const workOrderNum = currentDetailItem.workOrderNum;
        const maxSize = 20 * 1024 * 1024;

        const oversizedFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].size > maxSize) {
                const sizeMB = (files[i].size / (1024 * 1024)).toFixed(2);
                oversizedFiles.push(`${files[i].name} (${sizeMB} MB)`);
            }
        }

        if (oversizedFiles.length > 0) {
            alert(`❌ 以下檔案超過 20MB 限制：\n${oversizedFiles.join('\n')}\n\n請壓縮後再試`);
            event.target.value = "";
            return;
        }

        showUploadOverlay(`正在上傳 ${files.length} 張照片...`);

        const formData = new FormData();
        formData.append("workOrderNum", workOrderNum);

        for (let i = 0; i < files.length; i++) {
            formData.append("image", files[i]);
        }

        const res = await fetch("https://line.nldlab.com/api/scaner/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        hideUploadOverlay();

        if (res.ok && data.success) {
            const uploadedCount = data.uploadedCount || files.length;
            showSuccessMessage(`📸 成功上傳 ${uploadedCount} 張照片`);

            await loadWorkOrderImages(workOrderNum);
        } else {
            const errorMsg = data.message || "上傳失敗";
            alert(`❌ ${errorMsg}`);
        }

    } catch (err) {
        console.error("❌ Upload error:", err);
        hideUploadOverlay();

        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
            alert("❌ 網路連線失敗，請檢查網路後再試");
        } else {
            alert("❌ 無法上傳照片：" + err.message);
        }
    } finally {
        event.target.value = "";
    }
}

function showUploadOverlay(message = '上傳中...') {
    const overlay = document.createElement('div');
    overlay.id = 'uploadOverlay';
    overlay.className = 'upload-overlay';
    overlay.innerHTML = `
        <div class="upload-progress">
            <div class="spinner"></div>
            <div class="upload-text">📸 ${message}</div>
            <div class="upload-subtext">請稍候，正在處理您的照片</div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideUploadOverlay() {
    const overlay = document.getElementById('uploadOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s';
        setTimeout(() => overlay.remove(), 300);
    }
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        z-index: 10001;
        animation: slideDown 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

if (!document.getElementById('toastStyles')) {
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideUp {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

window.openCamera = openCamera;
window.handleImageCapture = handleImageCapture;