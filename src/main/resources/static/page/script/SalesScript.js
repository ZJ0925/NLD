// ===== 第1部分：在 SalesScript.js 開頭添加這個存儲類 =====
// 在所有現有代碼之前添加

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
                console.log('IndexedDB 初始化成功');
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
                        console.log('數據已儲存到 IndexedDB');
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
                        console.log('從 IndexedDB 獲取數據成功');
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
                        console.log('IndexedDB 數據已清理');
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
            console.log('localStorage 數據已清理');
        } catch (error) {
            console.error('localStorage 清理失敗:', error);
        }
    }

    // localStorage 回退方法
    saveToLocalStorage(data) {
        try {
            const compressedData = this.compressData(data);
            localStorage.setItem("nldData", JSON.stringify(compressedData));
            console.log('數據已儲存到 localStorage（壓縮後）');
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
                console.log('從 localStorage 獲取數據');
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


// Token檢查相關函數
function base64UrlDecode(str) {
    // base64url 轉 base64
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // 補足尾部 '='
    while (str.length % 4) {
        str += '=';
    }
    return atob(str);
}

// 修改後的 token 檢查函數 - 只在進入頁面時檢查，不做即時倒數
(function checkTokenOnPageLoad() {
    const token = localStorage.getItem("jwtToken");

    if (!token || token.split('.').length !== 3) {
        alert("尚未登入或 Token 格式錯誤，請重新登入。");
        localStorage.removeItem("jwtToken");
        window.location.href = "/index.html";
        return;
    }

    try {
        const payloadBase64Url = token.split('.')[1];
        const payloadJson = base64UrlDecode(payloadBase64Url);
        const payload = JSON.parse(payloadJson);

        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            alert("登入已過期，請重新登入。");
            localStorage.removeItem("jwtToken");
            window.location.href = "/index.html";
            return;
        }

        // 移除倒數計時器相關功能
        // 網頁內的查詢操作不受時間限制
        console.log("Token 驗證通過，可正常使用網頁功能");

    } catch (e) {
        console.error("無法解析 JWT:", e);
        alert("Token 格式解析失敗，請重新登入。");
        localStorage.removeItem("jwtToken");
        window.location.href = "/index.html";
    }
})();

// ===== 第4部分：替換現有的 checkTokenBeforeNavigation 函數 =====
// 找到你現有的 checkTokenBeforeNavigation 函數，完全替換為以下版本

async function checkTokenBeforeNavigation() {
    const token = localStorage.getItem("jwtToken");

    if (!token || token.split('.').length !== 3) {
        await nldStorage.clearData(); // 清理數據
        localStorage.removeItem("jwtToken");
        window.location.href = "/index.html";
        return false;
    }

    try {
        const payloadBase64Url = token.split('.')[1];
        const payloadJson = base64UrlDecode(payloadBase64Url);
        const payload = JSON.parse(payloadJson);

        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            alert("登入已過期，請重新登入。");
            await nldStorage.clearData(); // 清理數據
            localStorage.removeItem("jwtToken");
            window.location.href = "/index.html";
            return false;
        }
        return true;
    } catch (e) {
        console.error("無法解析 JWT:", e);
        await nldStorage.clearData(); // 清理數據
        localStorage.removeItem("jwtToken");
        window.location.href = "/index.html";
        return false;
    }
}

// ===== 第5部分：在文件末尾添加緊急清理功能 =====

// 緊急清理功能
async function emergencyCleanup() {
    try {
        await nldStorage.clearData();
        localStorage.clear();
        console.log("緊急清理完成");
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

window.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM載入完成，開始初始化...");

    // 檢查關鍵元素是否存在
    const listView = document.getElementById('listView');
    const searchInput = document.getElementById('searchInput');
    const backBtn = document.getElementById('backBtn');

    console.log("關鍵元素檢查:", {
        listView: !!listView,
        searchInput: !!searchInput,
        backBtn: !!backBtn
    });

    // 初始化資料（這會自動初始化存儲系統）
    await initializeData();

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
        console.log("手動重新整理資料");
        initializeData();
    };

    console.log("所有事件監聽器綁定完成");
});


// 監聽頁面離開事件（可選）
window.addEventListener('beforeunload', function(e) {
    // 這裡可以加入額外的檢查邏輯，但通常不需要阻止使用者離開
    // checkTokenBeforeNavigation();
});

// 日期比較函數
function isDateInRange(dateInput, startDate, endDate) {
    if (!dateInput) return !startDate && !endDate; // 若資料為空且沒篩選條件則通過
    if (!startDate && !endDate) return true; // 沒有限制則通過

    let date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        return false;
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && date < start) return false; // 早於開始日期則不通過
    if (end && date > end) return false; // 晚於結束日期則不通過
    return true; // 通過
}

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
        console.log("正在從API獲取資料...");

        const response = await fetch('/api/sales/workorders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log("API回應狀態:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("API回應資料筆數:", Array.isArray(data) ? data.length : "非陣列格式");

            // 使用新的存儲系統
            const saveSuccess = await nldStorage.saveData(data);
            if (saveSuccess) {
                console.log("數據儲存成功");
            } else {
                console.warn("數據儲存失敗，但不影響當前使用");
            }

            return data;
        } else {
            console.error("API請求失敗:", response.status, response.statusText);
            // API失敗時從存儲中獲取備份數據
            const backupData = await nldStorage.getData();
            if (backupData) {
                console.log("使用備份資料");
                return backupData;
            }
            return null;
        }
    } catch (error) {
        console.error('獲取資料時發生錯誤:', error);
        // 網路錯誤時從存儲中獲取備份數據
        const backupData = await nldStorage.getData();
        if (backupData) {
            console.log("網路錯誤，使用備份資料");
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
                    <div class="label">狀態</div>
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
const ITEMS_PER_PAGE = 30; // 每次顯示30筆
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

    console.log(`顯示 ${itemsToShow.length}/${dataList.length} 筆資料`);
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
    console.log("findEarliestDate 被調用，工單:", item ? item.workOrderNum : "無工單資料");

    if (!item) {
        console.log("沒有工單資料");
        return null;
    }

    const dates = [
        { date: item.receivedDate, name: '收件日' },
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

    console.log("找到的有效日期:", dates.map(d => `${d.name}: ${d.date.toLocaleDateString()}`));

    if (dates.length === 0) {
        console.log("該筆工單沒有找到有效日期，使用當前月份");
        return null;
    }

    // 找到最早的日期
    const earliest = dates.reduce((prev, current) =>
        prev.date < current.date ? prev : current
    );

    console.log(`該筆工單最早日期: ${earliest.name} - ${earliest.date.toLocaleDateString()}`);
    return earliest.date;
}

// ===== 修改1：替換現有的 showDetail 函數 =====
function showDetail(workOrderNum) {
    const item = filteredData.find(d => d.workOrderNum === workOrderNum);
    if (!item) return;

    currentDetailItem = item;

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

    // 關鍵修復：滾動到頁面頂部
    window.scrollTo(0, 0);

    // 如果是在移動設備上，也可以嘗試滾動 body
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// ===== 新增：需要在現有代碼中找到 showList 函數並替換 =====
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
}

// 顯示日曆視圖
function showCalendar() {
    console.log("showCalendar 被調用");

    if (!currentDetailItem) {
        console.log("沒有 currentDetailItem");
        alert("請先選擇一筆工單");
        return;
    }

    try {
        // 自動跳到最早日期的月份
        const earliestDate = findEarliestDate(currentDetailItem);

        if (earliestDate && earliestDate instanceof Date && !isNaN(earliestDate.getTime())) {
            currentCalendarYear = earliestDate.getFullYear();
            currentCalendarMonth = earliestDate.getMonth();
            console.log(`自動跳轉到: ${currentCalendarYear}年${currentCalendarMonth + 1}月`);
        } else {
            // 如果沒有有效日期，使用當前日期
            const now = new Date();
            currentCalendarYear = now.getFullYear();
            currentCalendarMonth = now.getMonth();
            console.log("使用當前日期");
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

    console.log(`生成 ${year}年${month + 1}月 日曆`);
    console.log('該筆工單的關鍵日期:', {
        收件日: receivedDateStr,
        完成交件日: deliveryDateStr,
        試戴交件日: tryInDateStr,
        試戴收件日: tryReceiveDateStr
    });

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
        if (receivedDateStr === currentDateStr) {
            dayElement.classList.add('receive-date'); // 黃色 - 收件日
            dayElement.title = '收件日';
        } else if (deliveryDateStr === currentDateStr) {
            dayElement.classList.add('delivery-date'); // 綠色 - 完成交件日
            dayElement.title = '完成交件日';
        } else if (tryInDateStr === currentDateStr) {
            dayElement.classList.add('try-receive-date'); // 紫色 - 試戴交件日和試戴收件日同色
            dayElement.title = '試戴交件日';
        } else if (tryReceiveDateStr === currentDateStr) {
            dayElement.classList.add('try-receive-date'); // 紫色 - 試戴交件日和試戴收件日同色
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
            color: '#ffeb3b',
            label: '收件日',
            date: legendData.received,
            rawDate: currentDetailItem.receivedDate
        });
    }

    // 完成交件日
    if (legendData.delivery) {
        legendItems.push({
            color: '#4caf50',
            label: '完成交件日',
            date: legendData.delivery,
            rawDate: currentDetailItem.deliveryDate
        });
    }

    // 試戴交件日
    if (legendData.tryIn) {
        legendItems.push({
            color: '#9c27b0',
            label: '試戴交件日',
            date: legendData.tryIn,
            rawDate: currentDetailItem.tryInDate
        });
    }

    // 試戴收件日
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
            console.log("無效的日期格式:", dateInput);
            return;
        }

        if (isNaN(targetDate.getTime())) {
            console.log("日期解析失敗:", dateInput);
            return;
        }

        // 更新當前日曆年月
        currentCalendarYear = targetDate.getFullYear();
        currentCalendarMonth = targetDate.getMonth();

        console.log(`跳轉到: ${currentCalendarYear}年${currentCalendarMonth + 1}月`);

        // 更新標題和重新生成日曆
        document.getElementById('calendarTitle').textContent = `${currentCalendarYear}年${currentCalendarMonth + 1}月`;
        generateCalendar(currentCalendarYear, currentCalendarMonth, currentDetailItem);

    } catch (error) {
        console.error("跳轉日期時發生錯誤:", error);
    }
}

// 修改現有的 filterData 函數
function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    // 重置顯示數量
    currentDisplayCount = ITEMS_PER_PAGE;

    if (!searchTerm) {
        filteredData = [...originalData];
    } else {
        filteredData = originalData.filter(item => {
            return (
                (item.workOrderNum && item.workOrderNum.toLowerCase().includes(searchTerm)) ||
                (item.clinicName && item.clinicName.toLowerCase().includes(searchTerm)) ||
                (item.patientName && item.patientName.toLowerCase().includes(searchTerm)) ||
                (item.docName && item.docName.toLowerCase().includes(searchTerm)) ||
                (item.toothPosition && item.toothPosition.toLowerCase().includes(searchTerm))
            );
        });
    }

    renderListView(filteredData);
}

// 在 initializeData 函數開始時重置顯示數量
async function initializeData() {
    console.log("開始初始化資料...");

    // 重置顯示數量
    currentDisplayCount = ITEMS_PER_PAGE;

    const listViewElement = document.getElementById("listView");
    if (!listViewElement) {
        console.error("找不到 listView 元素！");
        return;
    }

    // 其餘代碼保持不變...
    listViewElement.innerHTML = '<div class="loading">資料載入中...</div>';

    try {
        const storageReady = await nldStorage.init();
        console.log('存儲系統狀態:', storageReady ? 'IndexedDB' : 'localStorage備用');

        const data = await nldStorage.getData();

        if (data) {
            console.log("成功從存儲獲取資料，筆數:", Array.isArray(data) ? data.length : "非陣列格式");

            originalData = Array.isArray(data) ? data : [];
            filteredData = [...originalData];

            if (originalData.length > 0) {
                console.log("第一筆資料樣本:", originalData[0]);
            }

            renderListView(filteredData);
            console.log("資料載入完成！");
        } else {
            console.log("存儲中沒有資料，顯示提示");
            listViewElement.innerHTML = '<div class="loading" style="color: orange;">找不到資料，請重新登入或聯繫管理員</div>';
        }
    } catch (error) {
        console.error("初始化過程中發生錯誤:", error);
        listViewElement.innerHTML = '<div class="loading" style="color: red;">資料載入失敗，請重新整理頁面</div>';
    }
}

// 頁面載入完成後初始化
window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM載入完成，開始初始化...");

    // 檢查關鍵元素是否存在
    const listView = document.getElementById('listView');
    const searchInput = document.getElementById('searchInput');
    const backBtn = document.getElementById('backBtn');

    console.log("關鍵元素檢查:", {
        listView: !!listView,
        searchInput: !!searchInput,
        backBtn: !!backBtn
    });

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
        console.log("手動重新整理資料");
        initializeData();
    };

    console.log("所有事件監聽器綁定完成");
});


// 格式化今天的日期為 YYYY-MM-DD 格式
function formatTodayForInput() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 初始化日期篩選功能
function initializeDateFilter() {
    const endDateInput = document.getElementById('endDate');
    if (endDateInput) {
        // 預設結束日期為今天
        endDateInput.value = formatTodayForInput();
    }

    // 綁定事件監聽器
    const dateTypeSelect = document.getElementById('dateTypeSelect');
    const startDateInput = document.getElementById('startDate');
    const clearFilterBtn = document.getElementById('clearFilterBtn');

    if (dateTypeSelect) {
        dateTypeSelect.addEventListener('change', applyDateFilter);
    }

    if (startDateInput) {
        startDateInput.addEventListener('change', applyDateFilter);
    }

    if (endDateInput) {
        endDateInput.addEventListener('change', applyDateFilter);
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearDateFilter);
    }

    console.log('日期篩選功能已初始化');
}

// 應用日期篩選
function applyDateFilter() {
    console.log('應用日期篩選');

    // 重置顯示數量
    currentDisplayCount = ITEMS_PER_PAGE;

    // 執行綜合篩選
    performComprehensiveFilter();
}

// 清除日期篩選
function clearDateFilter() {
    console.log('清除日期篩選');

    const dateTypeSelect = document.getElementById('dateTypeSelect');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // 重置所有篩選條件
    if (dateTypeSelect) {
        dateTypeSelect.value = ''; // 設為"請選擇"
    }

    if (startDateInput) {
        startDateInput.value = '';
    }

    if (endDateInput) {
        endDateInput.value = formatTodayForInput(); // 重新設定為今天
    }

    // 重新應用篩選
    applyDateFilter();
}

// 執行綜合篩選（結合文字搜尋和日期篩選）
function performComprehensiveFilter() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const dateType = document.getElementById('dateTypeSelect').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    console.log('執行綜合篩選:', { searchTerm, dateType, startDate, endDate });

    // 重置顯示數量
    currentDisplayCount = ITEMS_PER_PAGE;

    // 檢查是否有任何篩選條件
    const hasSearchTerm = searchTerm.length > 0;
    const hasDateFilter = dateType && (startDate || endDate); // 必須選擇日期類型且有日期範圍

    if (!hasSearchTerm && !hasDateFilter) {
        // 沒有任何篩選條件，顯示全部資料
        filteredData = [...originalData];
    } else {
        filteredData = originalData.filter(item => {
            // 文字搜尋篩選
            let textMatch = true;
            if (hasSearchTerm) {
                textMatch = (
                    (item.workOrderNum && item.workOrderNum.toLowerCase().includes(searchTerm)) ||
                    (item.clinicName && item.clinicName.toLowerCase().includes(searchTerm)) ||
                    (item.patientName && item.patientName.toLowerCase().includes(searchTerm)) ||
                    (item.docName && item.docName.toLowerCase().includes(searchTerm)) ||
                    (item.toothPosition && item.toothPosition.toString().toLowerCase().includes(searchTerm))
                );
            }

            // 日期範圍篩選
            let dateMatch = true;
            if (hasDateFilter) {
                const targetDate = item[dateType];
                dateMatch = isDateInRange(targetDate, startDate, endDate);
            }

            return textMatch && dateMatch;
        });
    }

    console.log(`篩選結果: ${filteredData.length}/${originalData.length} 筆資料`);
    renderListView(filteredData);
}

// ===== 修改3：替換現有的 filterData 函數 =====
function filterData() {
    performComprehensiveFilter();
}

// ===== 修改4：替換現有的 isDateInRange 函數 =====
function isDateInRange(dateInput, startDate, endDate) {
    if (!dateInput) return !startDate && !endDate; // 若資料為空且沒篩選條件則通過
    if (!startDate && !endDate) return true; // 沒有限制則通過

    let date;
    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        return false;
    }

    // 檢查日期是否有效
    if (isNaN(date.getTime())) return false;

    // 將日期轉換為 YYYY-MM-DD 格式進行比較
    const dateStr = formatDateForCalendar(date);
    if (!dateStr) return false;

    if (startDate && dateStr < startDate) return false; // 早於開始日期則不通過
    if (endDate && dateStr > endDate) return false; // 晚於結束日期則不通過
    return true; // 通過
}

// ===== 修改5：替換現有的 DOMContentLoaded 事件監聽器 =====
window.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM載入完成，開始初始化...");

    // 檢查關鍵元素是否存在
    const listView = document.getElementById('listView');
    const searchInput = document.getElementById('searchInput');
    const backBtn = document.getElementById('backBtn');

    console.log("關鍵元素檢查:", {
        listView: !!listView,
        searchInput: !!searchInput,
        backBtn: !!backBtn
    });

    // 初始化資料（這會自動初始化存儲系統）
    await initializeData();

    // 初始化日期篩選功能
    initializeDateFilter();

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
        console.log("手動重新整理資料");
        initializeData();
    };

    console.log("所有事件監聽器綁定完成");
});

// 將 showDetail 和 jumpToDateMonth 函數設為全域函數，讓 HTML 中的 onclick 能夠呼叫
window.showDetail = showDetail;
window.jumpToDateMonth = jumpToDateMonth;
// 在文件末尾添加，讓 HTML 中的 onclick 能呼叫
window.loadMoreItems = loadMoreItems;