// ===== 第1部分：在 AdminScript.js 開頭添加這個存儲類 =====

// ===== 🚫 強力禁用瀏覽器返回（包括手勢） =====
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

        // ✅ 修正：使用 touchStartX 而不是 startX
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

        // 立即推入新的歷史記錄
        window.history.pushState(null, '', window.location.href);

        // 檢查當前頁面狀態
        const detailView = document.getElementById('detailView');
        const isDetailPage = detailView && detailView.style.display === 'block';

        if (isDetailPage) {
            // 在詳細頁面，返回到列表
            console.log('📄 在詳細頁面，返回列表');
            if (typeof showList === 'function') {
                showList();
            }
        } else {
            // 在列表頁面，阻止返回
            console.log('📋 在列表頁面，阻止返回');
        }

        return false;
    });

    // 3. 頁面可見性變化檢測（返回時重新推入歷史）
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            window.history.pushState(null, '', window.location.href);
            console.log('👁️ 頁面重新可見，重新推入歷史');
        }
    });

    console.log('✅ 返回阻止機制已啟用');
})();

// ===== 以下是你的原始代碼 =====
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



// ===== 簡單路由控制 =====

// 進入 Admin 時，記錄前一頁
sessionStorage.setItem('previousPage', 'roleSelection');

// 設置歷史狀態
history.pushState({ page: 'adminPage' }, 'Admin', window.location.href);

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
 * 儲存備註到後端
 */
async function saveRemarks() {
    if (!currentDetailItem || !currentDetailItem.workOrderNum) {
        alert('❌ 無法取得工單資訊');
        return;
    }

    const remarksTextarea = document.getElementById('detailRemarks');
    const newRemarks = remarksTextarea.value.trim();

    // 確認是否要儲存
    if (!confirm('確定要儲存備註嗎？')) {
        return;
    }

    const saveBtn = document.getElementById('saveRemarksBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '⏳ 儲存中...';
    saveBtn.disabled = true;

    try {
        const accessToken = localStorage.getItem('liffAccessToken');
        const groupId = localStorage.getItem('groupId');

        if (!accessToken || !groupId) {
            throw new Error('請重新登入');
        }

        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Admin/workorder/${currentDetailItem.workOrderNum}/remarks`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                groupId: groupId,
                remarks: newRemarks
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '儲存失敗');
        }

        const result = await response.json();

        // 顯示成功訊息
        showSuccessMessage('✅ 備註已成功儲存');

        // 更新本地資料
        currentDetailItem.remarks = newRemarks;

    } catch (error) {
        console.error('儲存備註錯誤:', error);
        alert(`❌ 儲存失敗：${error.message}`);
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// 暴露到全域
window.saveRemarks = saveRemarks;



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

// 暴露緊急清理功能到全局
window.emergencyCleanup = emergencyCleanup;

// ===== 修改 DOMContentLoaded 事件監聽器 =====
// 找到你現有的 window.addEventListener("DOMContentLoaded", ...)


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
        year: 'numeric',
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

// 渲染列表項目 - 管理者版本顯示更多資訊
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
                    <div class="label">業務</div>
                    <div class="value">${safeValue(item.salesName)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">單價</div>
                    <div class="value">${item.price ? `$${item.price.toLocaleString()}` : '-'}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">預計完成</div>
                    <div class="value">${formatDate(item.estFinishDate)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">工單現況</div>
                    <div class="value">${safeValue(item.workOrderStatus)}</div>
                </div>
                <div class="work-item-field">
                    <div class="label">醫師</div>
                    <div class="value">${safeValue(item.docName)}</div>
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

// ===== 載入業務列表 =====
async function loadSalesList() {
    console.log('🚀 開始載入業務列表');
    const accessToken = localStorage.getItem('liffAccessToken');
    const groupId = localStorage.getItem('groupId');

    console.log('🔑 accessToken:', accessToken ? '有' : '無');
    console.log('🏢 GroupId:', groupId);

    if (!accessToken || !groupId) {
        console.error('缺少必要的認證資訊');
        return;
    }

    try {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Admin/salesList?groupId=${groupId}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            throw new Error(`載入業務列表失敗: ${response.status}`);
        }

        const salesList = await response.json();
        console.log('✅ 業務列表資料:', salesList);

        // 填充下拉選單
        const salesSelect = document.getElementById('salesSelect');
        if (salesSelect && Array.isArray(salesList)) {
            // 清空現有選項（保留第一個預設選項）
            salesSelect.innerHTML = '<option value="">👤 請選擇業務</option>';

            // 加入業務選項
            salesList.forEach(sales => {
                const option = document.createElement('option');
                option.value = sales.name;          // ✅ 顯示業務姓名
                option.textContent = sales.name;   // ✅ 顯示業務姓名
                salesSelect.appendChild(option);
            });

            console.log('✅ 業務列表載入成功，共', salesList.length, '筆');
        }
    } catch (error) {
        console.error('載入業務列表錯誤:', error);
    }
}

/**
 * ✅ 费用区块插入函数 - 开眼👀 闭眼🔒
 */
function insertFeeBlockBeforeDateInfo(detailDataList) {
    // 移除之前可能存在的费用区块
    const existingFeeBlock = document.getElementById('feeBlockSection');
    if (existingFeeBlock) {
        existingFeeBlock.remove();
    }

    const detailContent = document.querySelector('.detail-content');
    if (!detailContent) {
        console.error('❌ 找不到 detail-content 元素');
        return;
    }

    console.log('📊 准备计算费用...');

    // 计算费用
    const totalAmount = detailDataList.length > 0 ? detailDataList[0].totalAmount : null;


    // ✅ 创建费用区块（即使是 0 也要显示！）
    const feeBlock = document.createElement('div');
    feeBlock.id = 'feeBlockSection';
    feeBlock.className = 'detail-section';
    feeBlock.style.marginBottom = '24px';

    const displayTotalAmount = totalAmount !== null && totalAmount !== undefined ?
        totalAmount : 0;

    // ✅ 转换为整数（移除小数点）
    const totalAmountInt = Math.round(displayTotalAmount);

    // 生成唯一ID
    const totalAmountToggleId = `totalAmountToggle_${Date.now()}`;

    feeBlock.innerHTML = `
    <!-- 工單總金額 -->
    <div class="detail-field">
        <div class="field-label">💳 工單總金額</div>
        <div class="field-value" style="display: flex; align-items: center; gap: 8px;">
            <span id="${totalAmountToggleId}_masked">●●●●●●</span>
            <span id="${totalAmountToggleId}_value" style="display: none;">$${totalAmountInt.toLocaleString('zh-TW')}</span>
            <button id="${totalAmountToggleId}_btn" 
                    style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 0; color: #666;" 
                    title="显示/隐藏金额">👀</button>
        </div>
    </div>
`;

    console.log('✅ 费用区块HTML已创建');

    // ✅ 尋找日期資訊區塊
    const allSections = detailContent.querySelectorAll('.detail-section');
    console.log('🔍 找到的 section 数量:', allSections.length);

    // 日期資訊是第 2 個 section（基本資訊是第 1 個）
    if (allSections.length >= 2) {
        const dateSection = allSections[1];
        console.log('✅ 在日期資訊前插入費用區塊');
        dateSection.parentNode.insertBefore(feeBlock, dateSection);
        console.log('✅ 費用區塊插入成功！');
    } else {
        console.warn('⚠️ 找不到日期資訊區塊，將費用區塊追加到末尾');
        detailContent.appendChild(feeBlock);
    }

    // ✅ 绑定眼睛按钮事件
    setTimeout(() => {
        setupToggleButtons(totalAmountToggleId);
    }, 100);
}

/**
 * 设置显示/隐藏按钮事件 - 开眼👀 闭眼🔒
 */
function setupToggleButtons(totalAmountToggleId) {
    // 工单总金额按钮
    const totalAmountBtn = document.getElementById(`${totalAmountToggleId}_btn`);
    if (totalAmountBtn) {
        totalAmountBtn.addEventListener('click', function() {
            const masked = document.getElementById(`${totalAmountToggleId}_masked`);
            const value = document.getElementById(`${totalAmountToggleId}_value`);

            if (masked.style.display === 'none') {
                // 隐藏金额，显示密码
                masked.style.display = 'inline';
                value.style.display = 'none';
                this.textContent = '👀';  // ✅ 开眼
            } else {
                // 显示金额，隐藏密码
                masked.style.display = 'none';
                value.style.display = 'inline';
                this.textContent = '🔒';  // ✅ 闭眼
            }
        });
    }

    console.log('✅ 眼睛按钮事件绑定成功！');
}

// 暴露到全局（确保可以调用）
window.insertFeeBlockBeforeDateInfo = insertFeeBlockBeforeDateInfo;
window.setupToggleButtons = setupToggleButtons;


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

// 在 safeValue 函數後面添加
function safeRemarksValue(value) {
    // 備註欄位專用：空值返回空字串而不是 '-'
    return (value === null || value === undefined || value === "NULL" || value === "-") ? '' : value;
}

async function showDetail(workOrderNum) {
    // 先從本地找到基本資訊（用於快速顯示）
    const item = filteredData.find(d => d.workOrderNum === workOrderNum);
    if (!item) return;

    // 保存當前滾動位置
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // ✅ 從後端查詢完整數據（包含所有齒位）
    const accessToken = localStorage.getItem('liffAccessToken');
    const groupId = localStorage.getItem('groupId');

    try {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Admin/workorder/${workOrderNum}?groupId=${groupId}`;

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

        // 第一筆用於基本信息顯示
        const detailItem = detailDataList.length > 0 ? detailDataList[0] : item;
        currentDetailItem = detailItem;

        // ===== 填入基本資訊 =====
        document.getElementById('detailWorkNum').textContent = safeValue(detailItem.workOrderNum);
        document.getElementById('detailClinic').textContent = safeValue(detailItem.clinicName);
        document.getElementById('detailDoctor').textContent = safeValue(detailItem.docName);
        document.getElementById('detailPatient').textContent = safeValue(detailItem.patientName);

        // 業務名稱
        document.getElementById('detailSales').textContent = safeValue(detailItem.salesName);

        // ✅ 新增：顯示所有齒位的詳細卡片（替換原本的簡單齒位顯示）
        displayToothPositionCards(detailDataList);

        insertFeeBlockBeforeDateInfo(detailDataList);

        // ===== 填入日期資訊 =====
        document.getElementById('detailReceiveDate').textContent = formatDate(detailItem.receivedDate);
        document.getElementById('detailExpectedDate').textContent = formatDate(detailItem.estFinishDate);
        document.getElementById('detailTryInDate').textContent = formatDate(detailItem.tryInDate);
        document.getElementById('detailDeliveryDate').textContent = formatDate(detailItem.deliveryDate);
        document.getElementById('detailTryReceiveDate').textContent = formatDate(detailItem.tryInReceivedDate);
        document.getElementById('detailExpectedTryDate').textContent = formatDate(detailItem.estTryInDate);

        // ===== 填入狀態資訊 =====
        //document.getElementById('detailStatus').textContent = safeValue(detailItem.workOrderStatus);

        const statusTags = [
            detailItem.isRemake && '重製',
            detailItem.isNoCharge && '不計價',
            detailItem.isPaused && '暫停',
            detailItem.isVoided && '作廢'
        ].filter(Boolean).join('、');
        document.getElementById('detailTags').textContent = statusTags || '-';
        document.getElementById('detailRemarks').value = safeRemarksValue(detailItem.remarks);

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

        // 詳細頁面滾動到頂部
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        // ✅ 延遲載入圖片,確保 DOM 準備好
        setTimeout(() => {
            if (typeof loadWorkOrderImages === 'function') {
                loadWorkOrderImages(workOrderNum);
            } else {
                console.error('loadWorkOrderImages 函數不存在');
            }
        }, 100);

    } catch (error) {
        console.error('查詢詳細數據時發生錯誤:', error);
        // 錯誤時顯示本地數據
        showDetailWithLocalData(item);
    }
}

/**
 * ✅ 显示齒位詳細卡片 - 单价加密显示
 * 替换现有的 displayToothPositionCards 函数
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

    // ✅ 添加 debug 日誌
    console.log('📊 開始顯示齒位卡片，共', detailDataList.length, '筆');
    console.log('📋 詳細資料:', detailDataList);

    // ❌ 這裡是問題！不要按齒位分組，直接顯示所有資料
    // 刪除這段分組邏輯：
    /*
    const groupedByTooth = {};
    detailDataList.forEach(item => {
        const tooth = safeValue(item.toothPosition);
        if (!groupedByTooth[tooth]) {
            groupedByTooth[tooth] = [];
        }
        groupedByTooth[tooth].push(item);
    });
    */

    // ✅ 改為：直接遍歷所有資料
    detailDataList.forEach((item, index) => {
        console.log(`🔹 處理第 ${index + 1} 筆:`, {
            齒位: item.toothPosition,
            製作項目: item.prodItem,
            產品名稱: item.prodName
        });

        const card = document.createElement('div');
        card.className = 'tooth-card';

        // 生成唯一ID（使用 index 確保不重複）
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
                                    title="显示/隐藏金额">👀</button>
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

        console.log(`✅ 第 ${index + 1} 筆卡片已加入 DOM`);

        // 绑定单价按钮事件
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
 * 使用本地數據顯示詳細信息（後端查詢失敗時）
 */
function showDetailWithLocalData(item) {
    currentDetailItem = item;

    document.getElementById('detailWorkNum').textContent = safeValue(item.workOrderNum);
    document.getElementById('detailClinic').textContent = safeValue(item.clinicName);
    document.getElementById('detailDoctor').textContent = safeValue(item.docName);
    document.getElementById('detailPatient').textContent = safeValue(item.patientName);
    document.getElementById('detailSales').textContent = safeValue(item.salesName);

    // 顯示單筆齒位卡片
    displayToothPositionCards([item]);

    document.getElementById('detailReceiveDate').textContent = formatDate(item.receivedDate);
    document.getElementById('detailExpectedDate').textContent = formatDate(item.estFinishDate);
    document.getElementById('detailTryInDate').textContent = formatDate(item.tryInDate);
    document.getElementById('detailDeliveryDate').textContent = formatDate(item.deliveryDate);
    document.getElementById('detailTryReceiveDate').textContent = formatDate(item.tryInReceivedDate);
    document.getElementById('detailExpectedTryDate').textContent = formatDate(item.estTryInDate);

    //document.getElementById('detailStatus').textContent = safeValue(item.workOrderStatus);

    const statusTags = [
        item.isRemake && '重製',
        item.isNoCharge && '不計價',
        item.isPaused && '暫停',
        item.isVoided && '作廢'
    ].filter(Boolean).join('、');
    document.getElementById('detailTags').textContent = statusTags || '-';
    document.getElementById('detailRemarks').value = safeRemarksValue(detailItem.remarks);

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

// 暴露函數到全域
window.displayToothPositionCards = displayToothPositionCards;
window.showDetailWithLocalData = showDetailWithLocalData;

function setupFloatingButtonsVisibility() {
    const floatingButtons = document.querySelector('.floating-buttons');

    if (!floatingButtons) {
        console.warn('找不到浮動按鈕元素');
        return;
    }

    // 監控頁面變化
    const observer = new MutationObserver(() => {
        // 檢查詳細頁面是否顯示
        const detailView = document.getElementById('detailView');
        const isDetailPage = detailView && detailView.style.display === 'block';

        // 只有在詳細頁面才顯示浮動按鈕
        if (isDetailPage) {
            floatingButtons.style.display = 'flex';
            console.log('✅ 顯示浮動按鈕');
        } else {
            floatingButtons.style.display = 'none';
            console.log('✅ 隱藏浮動按鈕');
        }
    });

    // 開始監控
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 首次運行
    setTimeout(() => {
        const detailView = document.getElementById('detailView');
        const isDetailPage = detailView && detailView.style.display === 'block';
        floatingButtons.style.display = isDetailPage ? 'flex' : 'none';
    }, 0);
}

// 暴露到全局
window.setupFloatingButtonsVisibility = setupFloatingButtonsVisibility;

// 自動運行
document.addEventListener('DOMContentLoaded', setupFloatingButtonsVisibility);

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

    const floatingButtons = document.querySelector('.floating-buttons');
    if (floatingButtons) {
        floatingButtons.style.display = 'none';
    }

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

// 修改:載入所有資料的函數
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
        const apiUrl = `${protocol}//${host}/NLD/Admin/workOrders`;

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

        // ✅ 如果後端還沒有 DISTINCT，就在前端去重
        // 如果已有 DISTINCT，這行不會有任何影響
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

// 搜尋按鈕點擊事件
async function performSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    const dateType = document.getElementById('dateTypeSelect').value;
    const startDate = document.getElementById('startDate').value;
    const salesName = document.getElementById('salesSelect').value;


    // === 防呆驗證 ===
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

    if (!keyword && !hasDateInput && !salesName) {
        alert('請至少輸入一個搜尋條件（關鍵字、日期或業務）');
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
        if (salesName) params.append('salesName', salesName);

        const protocol = window.location.protocol;
        const host = window.location.host;
        const apiUrl = `${protocol}//${host}/NLD/Admin/search?${params.toString()}`;

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
    // 清除所有搜尋條件
    document.getElementById('searchInput').value = '';
    document.getElementById('dateTypeSelect').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('salesSelect').value = '';

    // 清除後載入所有資料
    loadAllData();
}

// 在 DOMContentLoaded 中綁定搜尋按鈕
// 頁面載入完成後初始化
window.addEventListener("DOMContentLoaded", async () => {
    // 初始化資料
    await initializeData();

    setTimeout(async () => {
        console.log('📋 開始載入業務列表');
        await loadSalesList();
    }, 500);



    if (typeof setupFloatingButtonsVisibility === 'function') {
        setupFloatingButtonsVisibility();
    }

    // 檢查關鍵元素是否存在
    const listView = document.getElementById('listView');
    const searchInput = document.getElementById('searchInput');
    const backBtn = document.getElementById('backBtn');

    // 搜尋按鈕
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // Enter 鍵搜尋
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
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // 如果在詳細頁面，先回到列表
            if (document.getElementById('detailView').style.display === 'block') {
                showList();
            }
            // 如果在列表頁面，回到 route/index.html
            else {
                window.location.href = '/route/index.html';
            }
        });
    }

    // ✅✅✅ 拍照浮動按鈕 - 修正版 ✅✅✅
    const cameraFloatBtn = document.getElementById('cameraFloatBtn');
    const cameraInput = document.getElementById('cameraInput');

    if (cameraFloatBtn && cameraInput) {
        // 桌機/一般 click 事件
        cameraFloatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            //debug("📸 相機按鈕被點擊 (click)");

            if (!currentDetailItem?.workOrderNum) {
                alert('⚠️ 請先選擇工單再拍照');
                return;
            }

            // 延遲觸發，讓 iOS 有時間反應
            setTimeout(() => {
                //debug("🎯 準備觸發 input.click()");
                cameraInput.click();
            }, 100);
        });

        // 手機觸控事件
        cameraFloatBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();

            //debug("📱 相機按鈕被觸控 (touchend)");

            if (!currentDetailItem?.workOrderNum) {
                alert('⚠️ 請先選擇工單再拍照');
                return;
            }

            setTimeout(() => {
                //debug("🎯 準備觸發 input.click() (touch)");
                cameraInput.click();
            }, 100);
        }, { passive: false });
    }

// ✅ 檔案輸入變更事件
    if (cameraInput) {
        cameraInput.addEventListener('change', async (e) => {
            //debug("📁 Change 事件觸發！檔案數量: " + e.target.files.length);

            if (e.target.files.length > 0) {
                await handleImageCapture(e);
            }
        });
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

    // 添加重新整理功能（可選）
    window.refreshData = function() {
        initializeData();
    };
});


// 將 showDetail 和 jumpToDateMonth 函數設為全域函數，讓 HTML 中的 onclick 能夠呼叫
window.showDetail = showDetail;
window.jumpToDateMonth = jumpToDateMonth;
// 在文件末尾添加，讓 HTML 中的 onclick 能呼叫
window.loadMoreItems = loadMoreItems;



// ============================================
// 完整版圖片載入函數 - 小一點的紅色 X,靠近頂部
// ============================================

async function loadWorkOrderImages(workOrderNum) {
    const imageContainer = document.getElementById('imageContainer');

    if (!imageContainer) {
        console.error('找不到 imageContainer 元素');
        return;
    }

    // 顯示載入中
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

        // 發送 API 請求
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

        // ✅ 如果沒有圖片 - 顯示小一點的紅色 X,靠近頂部
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

        // 清空容器並建立圖片網格 (增加底部 padding)
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

        // 載入每張圖片
        imageUrls.forEach((url, index) => {
            // 建立圖片容器
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

            // 加入點擊提示
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

            // Hover 效果
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

            // 手機觸控效果
            imgWrapper.ontouchstart = () => {
                imgWrapper.style.transform = 'scale(0.95)';
            };
            imgWrapper.ontouchend = () => {
                imgWrapper.style.transform = 'scale(1)';
            };

            // 顯示載入指示
            imgWrapper.innerHTML += '<div style="color:#999; font-size:12px;">載入中...</div>';

            // 建立圖片元素
            const img = new Image();

            // 確保 URL 是完整路徑
            let fullImageUrl;
            if (url.startsWith('http://') || url.startsWith('https://')) {
                fullImageUrl = url;
            } else if (url.startsWith('/')) {
                fullImageUrl = `https://line.nldlab.com${url}`;
            } else {
                fullImageUrl = `https://line.nldlab.com/${url}`;
            }

            // 設定圖片樣式
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;

            // 圖片載入成功
            img.onload = function() {
                // 清除載入中文字,保留點擊提示
                const loadingText = imgWrapper.querySelector('div:not([style*="position: absolute"])');
                if (loadingText) {
                    loadingText.remove();
                }
                imgWrapper.appendChild(img);
            };

            // 圖片載入失敗
            img.onerror = function() {
                imgWrapper.innerHTML = `
                    <div style="text-align:center; color:#f44336;">
                        <div style="font-size:32px; margin-bottom:5px;">❌</div>
                        <div style="font-size:11px;">載入失敗</div>
                    </div>
                `;
            };

            // 點擊放大 - 全螢幕預覽
            imgWrapper.onclick = function(e) {
                e.preventDefault();

                // 建立全螢幕預覽
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

                // 關閉按鈕
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

                // 點擊任何地方關閉
                overlay.onclick = function(e) {
                    if (e.target === overlay || e.target === closeBtn) {
                        overlay.style.animation = 'fadeOut 0.2s';
                        setTimeout(() => overlay.remove(), 200);
                    }
                };
            };

            // 開始載入圖片
            img.src = fullImageUrl;

            // 加入到容器
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

// ✅ 加入 CSS 動畫 (放在檔案最後面,只加入一次)
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

// ✅ 加入 CSS 動畫 (放在檔案最後面)
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

// 開啟相機
function openCamera() {
    // 檢查是否在詳細頁面
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

// 處理拍照/選擇的圖片
async function handleImageCapture(event) {
    //debug("📱 iOS input change fired");
    //debug("📁 file count = " + event.target.files.length);

    const file = event.target.files[0];
    if (!file) {
        //debug("❌ No file captured");
        return;
    }

    if (!currentDetailItem?.workOrderNum) {
        alert("⚠️ 請先選擇工單再拍照");
        event.target.value = "";
        return;
    }

    try {
        const workOrderNum = currentDetailItem.workOrderNum;

        // ✅ 檢查檔案大小（20MB = 20 * 1024 * 1024 bytes）
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            alert(`❌ 檔案太大！\n檔案大小: ${sizeMB} MB\n最大限制: 20 MB\n\n請壓縮照片後再試`);
            event.target.value = "";
            return;
        }

        //debug(`📤 上傳檔案: ${file.name}, 大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

        showUploadOverlay(); // 顯示載入中

        const formData = new FormData();
        formData.append("image", file);
        formData.append("workOrderNum", workOrderNum);

        const res = await fetch("https://line.nldlab.com/api/scaner/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        hideUploadOverlay(); // 隱藏載入中

        if (res.ok && data.success) {
            //debug("✅ upload success: " + JSON.stringify(data));
            showSuccessMessage("📸 照片上傳成功");

            // 重新載入圖片列表
            await loadWorkOrderImages(workOrderNum);
        } else {
            //debug("❌ upload error: " + JSON.stringify(data));

            // 顯示後端回傳的錯誤訊息
            const errorMsg = data.message || "上傳失敗";
            alert(`❌ ${errorMsg}`);
        }

    } catch (err) {
        console.error("❌ Upload error:", err);
        hideUploadOverlay();

        // 檢查是否是網路錯誤
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
            alert("❌ 網路連線失敗，請檢查網路後再試");
        } else {
            alert("❌ 無法上傳照片：" + err.message);
        }
    } finally {
        event.target.value = ""; // 清空 input
    }
}


// 顯示上傳中遮罩
function showUploadOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'uploadOverlay';
    overlay.className = 'upload-overlay';
    overlay.innerHTML = `
        <div class="upload-progress">
            <div class="spinner"></div>
            <div class="upload-text">📸 上傳中...</div>
            <div class="upload-subtext">請稍候，正在處理您的照片</div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// 隱藏上傳中遮罩
function hideUploadOverlay() {
    const overlay = document.getElementById('uploadOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s';
        setTimeout(() => overlay.remove(), 300);
    }
}

// 顯示成功訊息
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

    // 3秒後自動消失
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 添加動畫樣式
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

// 暴露全域函數
window.openCamera = openCamera;
window.handleImageCapture = handleImageCapture;



