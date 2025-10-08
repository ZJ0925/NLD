// ===== 第1部分：在 SalesScript.js 開頭添加這個存儲類 =====
// 在所有現有代碼之前添加
// 在全局變數區域加入(檔案開頭附近,與其他全局變數放在一起)
let scrollPosition = 0;

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
                resolve(false); // 失敗時回退到 localStorage
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
            // 回退到 localStorage，但加上錯誤處理
            return this.saveToLocalStorage(data);
        }

        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['nldData'], 'readwrite');
                const store = transaction.objectStore('nldData');

                // 清空舊數據並儲存新數據
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
            // 回退到 localStorage
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
                        // IndexedDB 中沒有數據，嘗試從 localStorage 獲取
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

        // 同時清理 localStorage
        try {
            localStorage.removeItem("nldData");
        } catch (error) {
            console.error('localStorage 清理失敗:', error);
        }
    }

    // localStorage 回退方法
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

    // 數據壓縮（用於 localStorage 回退）
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
        })).filter(item => item.workOrderNum); // 過濾掉無效數據
    }
}

// 創建全局存儲實例
const nldStorage = new NLDStorage();


// ===== 第5部分：在文件末尾添加緊急清理功能 =====

// 緊急清理功能
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

// 暴露緊急清理功能到全局
window.emergencyCleanup = emergencyCleanup;

// ===== 修改 DOMContentLoaded 事件監聽器 =====
// 找到你現有的 window.addEventListener("DOMContentLoaded", ...)
// 完全替換為以下版本：


// 監聽頁面離開事件（可選）
window.addEventListener('beforeunload', function(e) {
    // 這裡可以加入額外的檢查邏輯，但通常不需要阻止使用者離開
});


// 全局變數
let originalData = [];
let filteredData = [];
let currentDetailItem = null;
let currentCalendarYear = new Date().getFullYear();
let currentCalendarMonth = new Date().getMonth();

// ===== 第2部分：替換現有的 fetchDataFromAPI 函數 =====
// 找到你現有的 fetchDataFromAPI 函數，完全替換為以下版本

async function fetchDataFromAPI() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        console.error("沒有找到JWT token");
        return null;
    }

    try {

        const response = await fetch('/api/sales/workorders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            // 使用新的存儲系統
            const saveSuccess = await nldStorage.saveData(data);

            return data;
        } else {
            console.error("API請求失敗:", response.status, response.statusText);
            // API失敗時從存儲中獲取備份數據
            const backupData = await nldStorage.getData();
            if (backupData) {
                return backupData;
            }
            return null;
        }
    } catch (error) {
        console.error('獲取資料時發生錯誤:', error);
        // 網路錯誤時從存儲中獲取備份數據
        const backupData = await nldStorage.getData();
        if (backupData) {
            return backupData;
        }
        return null;
    }
}

// 格式化日期顯示 - 支援後端Date物件和字串格式
function formatDate(dateInput) {
    if (!dateInput) return '-';

    let date;
    // 處理不同的日期輸入格式
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
        month: 'numeric',
        day: 'numeric'
    });
}

function formatFullDate(dateInput) {
    if (!dateInput) return '-';

    let date;
    // 處理不同的日期輸入格式
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

// 將日期轉換為 YYYY-MM-DD 格式用於日曆比對
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

// 安全處理 null 值的輔助函數
function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '-' : value;
}

// 處理齒位顯示，超過一定長度就省略
function formatToothPosition(toothPosition) {
    if (!toothPosition) return '-';
    const str = toothPosition.toString();
    if (str.length > 20) { // 如果超過20個字元就省略
        return str.substring(0, 17) + '...';
    }
    return str;
}

// 生成狀態標籤HTML
function generateStatusTags(item) {
    const tags = [];
    if (item.isRemake) tags.push('<span class="status-tag status-remake">重製</span>');
    if (item.isNoCharge) tags.push('<span class="status-tag status-nocharge">不計價</span>');
    if (item.isPaused) tags.push('<span class="status-tag status-pause">暫停</span>');
    if (item.isVoided) tags.push('<span class="status-tag status-void">作廢</span>');
    return tags.join('');
}

// 渲染列表項目
function renderListItem(item) {
    return `
        <div class="work-item" onclick="showDetail('${item.workOrderNum}')">
            <div class="work-item-header">
                <div class="clinic-name">${safeValue(item.clinicName)}</div>
                <div class="work-order-num">${safeValue(item.workOrderNum)}</div>
            </div>
            <div class="work-item-content">
                <div class="work-item-field">
                    <div class="label">患者</div>
                    <div class="value">${safeValue(item.patientName)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">齒位</div>
                    <div class="value">${formatToothPosition(item.toothPosition)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">預計完成</div>
                    <div class="value">${formatDate(item.estFinishDate)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">工單現況</div>
                    <div class="value">${safeValue(item.workOrderStatus)}</div>
                </div>
            </div>
            <div class="status-tags">
                ${generateStatusTags(item)}
            </div>
        </div>
    `;
}

// 分頁設定
const ITEMS_PER_PAGE = 50; // 每次顯示50筆
let currentDisplayCount = ITEMS_PER_PAGE;

// 修改現有的 renderListView 函數
function renderListView(dataList) {
    const listView = document.getElementById('listView');

    if (!dataList || dataList.length === 0) {
        listView.innerHTML = '<div class="loading">查無資料</div>';
        return;
    }

    // 只顯示前 currentDisplayCount 筆資料
    const itemsToShow = dataList.slice(0, currentDisplayCount);
    const itemsHtml = itemsToShow.map(renderListItem).join('');

    listView.innerHTML = itemsHtml;

    // 如果還有更多資料，顯示載入更多按鈕
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

// 新增載入更多項目的函數
function loadMoreItems() {
    currentDisplayCount += ITEMS_PER_PAGE;
    renderListView(filteredData);

    // 滾動到新載入的項目位置
    setTimeout(() => {
        const newItemIndex = Math.max(0, currentDisplayCount - ITEMS_PER_PAGE);
        const workItems = document.querySelectorAll('.work-item');
        if (workItems[newItemIndex]) {
            workItems[newItemIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// 找到該筆工單最早的有效日期
function findEarliestDate(item) {

    if (!item) {
        return null;
    }

    const dates = [
        { date: item.receivedDate, name: '收模日' },
        { date: item.deliveryDate, name: '完成交件日' },
        { date: item.tryInDate, name: '試戴交件日' },
        { date: item.tryInReceivedDate, name: '試戴收件日' }
    ].filter(d => d.date) // 過濾掉空值
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
        }).filter(Boolean); // 移除無效日期


    if (dates.length === 0) {
        return null;
    }

    // 找到最早的日期
    const earliest = dates.reduce((prev, current) =>
        prev.date < current.date ? prev : current
    );

    return earliest.date;
}

// 修改 showDetail 函數
function showDetail(workOrderNum) {
    const item = filteredData.find(d => d.workOrderNum === workOrderNum);
    if (!item) return;

    currentDetailItem = item;

    // 儲存當前捲動位置
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // 填入資料
    document.getElementById('detailWorkNum').textContent = safeValue(item.workOrderNum);
    document.getElementById('detailClinic').textContent = safeValue(item.clinicName);
    document.getElementById('detailDoctor').textContent = safeValue(item.docName);
    document.getElementById('detailPatient').textContent = safeValue(item.patientName);
    document.getElementById('detailToothPosition').textContent = safeValue(item.toothPosition);
    document.getElementById('detailPrice').textContent = item.price ? `$${item.price.toLocaleString()}` : '-';

    const productText = item.prodItem ? `${item.prodItem} - ${safeValue(item.prodName)}` : safeValue(item.prodName);
    document.getElementById('detailProductName').textContent = productText;

    document.getElementById('detailReceiveDate').textContent = formatDate(item.receivedDate);
    document.getElementById('detailExpectedDate').textContent = formatDate(item.estFinishDate);
    document.getElementById('detailTryInDate').textContent = formatDate(item.tryInDate);
    document.getElementById('detailDeliveryDate').textContent = formatDate(item.deliveryDate);
    document.getElementById('detailTryReceiveDate').textContent = formatDate(item.tryInReceivedDate);
    document.getElementById('detailExpectedTryDate').textContent = formatDate(item.estTryInDate);
    document.getElementById('detailStatus').textContent = safeValue(item.workOrderStatus);

    // 隱藏搜尋區塊
    const searchHeader = document.querySelector('.search-header');
    if (searchHeader) {
        searchHeader.classList.add('hidden');
    }

    const statusTags = [
        item.isRemake && '重製',
        item.isNoCharge && '不計價',
        item.isPaused && '暫停',
        item.isVoided && '作廢'
    ].filter(Boolean).join('、');
    document.getElementById('detailTags').textContent = statusTags || '-';
    document.getElementById('detailRemarks').textContent = safeValue(item.remarks);

    // 切換視圖
    document.getElementById('listView').style.display = 'none';
    document.getElementById('detailView').style.display = 'block';

    // 詳細頁面滾動到頂部
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// 修改 showList 函數
function showList() {
    // 顯示搜尋區塊
    const searchHeader = document.querySelector('.search-header');
    if (searchHeader) {
        searchHeader.classList.remove('hidden');
    }

    document.getElementById('listView').style.display = 'block';
    document.getElementById('detailView').style.display = 'none';
    document.getElementById('calendarView').style.display = 'none';
    currentDetailItem = null;

    // 恢復到之前的捲動位置
    setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        document.documentElement.scrollTop = scrollPosition;
        document.body.scrollTop = scrollPosition;
    }, 0);
}

// 顯示日曆視圖
function showCalendar() {

    if (!currentDetailItem) {
        alert("請先選擇一筆工單");
        return;
    }

    try {
        // 自動跳到最早日期的月份
        const earliestDate = findEarliestDate(currentDetailItem);

        if (earliestDate && earliestDate instanceof Date && !isNaN(earliestDate.getTime())) {
            currentCalendarYear = earliestDate.getFullYear();
            currentCalendarMonth = earliestDate.getMonth();
        } else {
            // 如果沒有有效日期，使用當前日期
            const now = new Date();
            currentCalendarYear = now.getFullYear();
            currentCalendarMonth = now.getMonth();
        }

        // 更新標題和生成日曆
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

// 日曆導航功能
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

    // 更新標題和重新生成日曆
    document.getElementById('calendarTitle').textContent = `${currentCalendarYear}年${currentCalendarMonth + 1}月`;
    generateCalendar(currentCalendarYear, currentCalendarMonth, currentDetailItem);
}

// 生成日曆
function generateCalendar(year, month, item) {
    const grid = document.getElementById('calendarGrid');
    // 清除現有日期格子，保留星期標題
    const dayHeaders = grid.querySelectorAll('.calendar-day-header');
    grid.innerHTML = '';
    dayHeaders.forEach(header => grid.appendChild(header));

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = firstDay.getDay(); // 第一天是星期幾

    // 將各個日期轉換為比對用的格式和完整日期顯示
    const receivedDateStr = formatDateForCalendar(item.receivedDate);
    const deliveryDateStr = formatDateForCalendar(item.deliveryDate);
    const tryInDateStr = formatDateForCalendar(item.tryInDate);
    const tryReceiveDateStr = formatDateForCalendar(item.tryInReceivedDate);

    // 準備圖例用的完整日期
    const legendData = {
        received: receivedDateStr ? formatFullDate(item.receivedDate) : null,
        delivery: deliveryDateStr ? formatFullDate(item.deliveryDate) : null,
        tryIn: tryInDateStr ? formatFullDate(item.tryInDate) : null,
        tryReceive: tryReceiveDateStr ? formatFullDate(item.tryInReceivedDate) : null
    };


    // 生成日期格子
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

        // 檢查是否有對應的日期事件 - 調整顏色分配
// 檢查是否有對應的日期事件 - 調整顏色分配
        if (receivedDateStr === currentDateStr) {
            dayElement.classList.add('receive-date'); // 橘色 - 收件日
            dayElement.title = '收件日';
        } else if (deliveryDateStr === currentDateStr) {
            dayElement.classList.add('delivery-date'); // 綠色 - 完成交件日
            dayElement.title = '完成交件日';
        } else if (tryInDateStr === currentDateStr) {
            dayElement.classList.add('try-in-date'); // 藍色 - 試戴交件日
            dayElement.title = '試戴交件日';
        } else if (tryReceiveDateStr === currentDateStr) {
            dayElement.classList.add('try-receive-date'); // 紫色 - 試戴收件日
            dayElement.title = '試戴收件日';
        }

        grid.appendChild(dayElement);
    }

    // 生成圖例
    generateCalendarLegend(legendData);
}

// 生成帶日期的圖例
function generateCalendarLegend(legendData) {
    const legendContainer = document.querySelector('.calendar-legend');
    if (!legendContainer) return;

    const legendItems = [];

    // 收件日
    if (legendData.received) {
        legendItems.push({
            color: '#ff9800',  // 橘色
            label: '收件日',
            date: legendData.received,
            rawDate: currentDetailItem.receivedDate
        });
    }

    // 完成交件日
    if (legendData.delivery) {
        legendItems.push({
            color: '#4caf50',  // 綠色
            label: '完成交件日',
            date: legendData.delivery,
            rawDate: currentDetailItem.deliveryDate
        });
    }

    // 試戴交件日
    if (legendData.tryIn) {
        legendItems.push({
            color: '#2196f3',  // 藍色
            label: '試戴交件日',
            date: legendData.tryIn,
            rawDate: currentDetailItem.tryInDate
        });
    }

    // 試戴收件日
    if (legendData.tryReceive) {
        legendItems.push({
            color: '#9c27b0',  // 紫色
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

// 跳轉到指定日期的月份
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

        // 更新當前日曆年月
        currentCalendarYear = targetDate.getFullYear();
        currentCalendarMonth = targetDate.getMonth();


        // 更新標題和重新生成日曆
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

    // 載入所有資料 (使用第一個 API)
    await loadAllData();
}

// 新增:載入所有資料的函數
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

        const data = await response.json();
        originalData = Array.isArray(data) ? data : [];
        filteredData = [...originalData];

        await nldStorage.saveData(data);
        renderListView(filteredData);

    } catch (error) {
        console.error('載入資料錯誤:', error);
        listView.innerHTML = '<div class="loading" style="color: red;">資料載入失敗</div>';
    }
}


// 頁面載入完成後初始化
window.addEventListener("DOMContentLoaded", () => {

    // 檢查關鍵元素是否存在
    const listView = document.getElementById('listView');
    const searchInput = document.getElementById('searchInput');
    const backBtn = document.getElementById('backBtn');


    // 初始化資料
    initializeData();

    // 綁定事件監聽器
    if (searchInput) {
        searchInput.addEventListener('input', filterData);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterData();
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', showList);
    }

    // 日曆按鈕 - 防止雙擊縮放
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

    // 日曆關閉按鈕 - 防止雙擊縮放
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

    // 使用 touchstart 和 click 事件，並防止預設行為
    function addNavigationListener(element, direction) {
        if (!element) return;

        let touchHandled = false;

        element.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止雙擊縮放
            touchHandled = true;
            navigateCalendar(direction);
        });

        element.addEventListener('click', (e) => {
            e.preventDefault(); // 防止雙擊縮放
            if (!touchHandled) {
                navigateCalendar(direction);
            }
            touchHandled = false;
        });
    }

    // 綁定日曆導航按鈕 - 防止雙擊縮放
    const prevYear = document.getElementById('prevYear');
    const nextYear = document.getElementById('nextYear');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');

    addNavigationListener(prevYear, 'prevYear');
    addNavigationListener(nextYear, 'nextYear');
    addNavigationListener(prevMonth, 'prevMonth');
    addNavigationListener(nextMonth, 'nextMonth');

    // 添加重新整理功能（可選）
    window.refreshData = function() {
        initializeData();
    };

});


// 格式化今天的日期為 YYYY-MM-DD 格式
function formatTodayForInput() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// 搜尋按鈕點擊事件
async function performSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    const dateType = document.getElementById('dateTypeSelect').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const accessToken = localStorage.getItem('liffAccessToken');
    const groupId = localStorage.getItem('groupId');


    // === 防呆驗證 ===
    // 檢查是否有任何日期相關的輸入
    const hasDateInput = dateType || startDate || endDate;

    if (hasDateInput) {
        // 如果有任何日期相關輸入，就需要完整的日期資訊
        if (!dateType) {
            alert('請選擇日期類型');
            return;
        }
        if (!startDate || !endDate) {
            alert('請選擇完整的日期區間（開始日期和結束日期）');
            return;
        }

        // 驗證日期區間是否合理
        if (new Date(startDate) > new Date(endDate)) {
            alert('開始日期不能晚於結束日期');
            return;
        }
    }

    // 檢查是否至少有一個搜尋條件
    if (!keyword && !hasDateInput) {
        alert('請至少輸入一個搜尋條件（關鍵字或日期篩選）');
        return;
    }

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
        if (endDate) params.append('endDate', endDate);

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

        const data = await response.json();
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
    document.getElementById('endDate').value = formatTodayForInput();

    // 清除後載入所有資料,不是搜尋
    loadAllData();
}

// 在 DOMContentLoaded 中綁定搜尋按鈕
window.addEventListener("DOMContentLoaded", async () => {
    await initializeData();

    // 搜尋按鈕
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // Enter 鍵搜尋
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // 清除按鈕
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearAndSearch);
    }

    // 返回按鈕
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', showList);
    }

    // 日曆按鈕
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

    // 日曆關閉按鈕
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

    // 日曆導航按鈕
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

    // 電腦版:點擊日曆外部區域關閉日曆
    const calendarView = document.getElementById('calendarView');
    if (calendarView) {
        calendarView.addEventListener('click', function(e) {
            // 只在電腦版執行(螢幕寬度 >= 768px)
            if (window.innerWidth >= 768) {
                // 如果點擊的是日曆視圖的背景(不是內容區域)
                if (e.target === calendarView) {
                    calendarView.style.display = 'none';
                }
            }
        });

        // 防止點擊日曆內容時關閉
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

    addNavigationListener(document.getElementById('prevYear'), 'prevYear');
    addNavigationListener(document.getElementById('nextYear'), 'nextYear');
    addNavigationListener(document.getElementById('prevMonth'), 'prevMonth');
    addNavigationListener(document.getElementById('nextMonth'), 'nextMonth');
});


// 將 showDetail 和 jumpToDateMonth 函數設為全域函數，讓 HTML 中的 onclick 能夠呼叫
window.showDetail = showDetail;
window.jumpToDateMonth = jumpToDateMonth;
// 在文件末尾添加，讓 HTML 中的 onclick 能呼叫
window.loadMoreItems = loadMoreItems;