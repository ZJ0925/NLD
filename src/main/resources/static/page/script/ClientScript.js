// ===== 在 ClientScript.js 開頭添加存儲類 =====
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
                resolve(false);
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
                        console.log('從 IndexedDB 獲取數據成功');
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

        try {
            localStorage.removeItem("nldData");
            console.log('localStorage 數據已清理');
        } catch (error) {
            console.error('localStorage 清理失敗:', error);
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
}

// 創建全局存儲實例
const nldStorage = new NLDStorage();


// 監聽頁面離開事件（可選）
window.addEventListener('beforeunload', function(e) {

});



// 原始資料存儲
let originalData = []; // 儲存未過濾的原始資料
let filteredData = []; // 儲存過濾後的資料

// 格式化日期顯示
function formatDate(dateStr) {
    if (!dateStr) return ''; // 若為空值、null 或 undefined 則回傳空字串
    const date = new Date(dateStr); // 建立日期物件
    // 檢查日期是否有效
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('zh-TW', { // 回傳中文格式的日期
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 安全處理 null 值的輔助函數
function safeValue(value) {
    return (value === null || value === undefined || value === "NULL") ? '' : value;
}

// 渲染一列資料
function renderRow(dto) {
    const statusTags = [ // 根據布林值顯示狀態標籤
        dto.isRemake && '重製',
        dto.isNoCharge && '不計價',
        dto.isPaused && '暫停',
        dto.isVoided && '作廢'
    ].filter(Boolean).join('、'); // 移除 false 並用逗號連接

    const remarksWithStatus = [safeValue(dto.remarks), statusTags].filter(Boolean).join(' '); // 合併備註與狀態標籤

    return `
        <tr>
            <td>${dto.workOrderNum || ''}</td> <!-- 技工單號 -->
            <td>${dto.docName || ''}</td> <!-- 醫生姓名 -->
            <td>${dto.patientName || ''}</td> <!-- 患者姓名 -->
            <td>${formatDate(dto.deliveryDate)}</td> <!-- 完成交件 -->
            <td>${dto.toothPosition || ''}</td> <!-- 齒位 -->
            <td>${dto.prodItem ? dto.prodItem + ' - ' + (dto.prodName || '') : dto.prodName || ''}</td> <!-- 產品名稱 -->
            <td>${formatDate(dto.tryInDate)}</td> <!-- 試戴交件 -->
            <td>${dto.workOrderStatus || ''}</td> <!-- 工單現況 -->
            <td><span class="status-tags">${remarksWithStatus}</span></td> <!-- 備註與狀態 -->
        </tr>
    `;
}

// 渲染整個表格
function renderTable(dataList) {
    const tbody = document.getElementById("dataBody"); // 取得表格 tbody 元素
    if (!dataList || dataList.length === 0) { // 無資料情況
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">查無資料</td></tr>`;
    } else {
        tbody.innerHTML = dataList.map(renderRow).join(''); // 渲染所有列
    }
}

// 日期比較函數
function isDateInRange(dateStr, startDate, endDate) {
    if (!dateStr) return !startDate && !endDate; // 若資料為空且沒篩選條件則通過
    if (!startDate && !endDate) return true; // 沒有限制則通過

    const date = new Date(dateStr);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && date < start) return false; // 早於開始日期則不通過
    if (end && date > end) return false; // 晚於結束日期則不通過
    return true; // 通過
}

// 過濾功能
function filterData() {
    const filters = {
        // 技工單號（模糊比對）
        jobId: document.getElementById('jobId').value.toLowerCase(),
        // 醫生姓名（模糊比對）
        doctor: document.getElementById('doctor').value.toLowerCase(),
        // 患者姓名（模糊比對）
        patientName: document.getElementById('patientName').value.toLowerCase(),
        // 齒位（模糊比對）
        toothPosition: document.getElementById('toothPosition').value.toLowerCase(),
        // 產品名稱（prodItem + prodName 合併後模糊比對）
        productName: document.getElementById('productName').value.toLowerCase(),
        // 工單現況（模糊比對）
        currentStatus: document.getElementById('currentStatus').value.toLowerCase(),
        // 備註（含狀態標籤，模糊比對）
        remarks: document.getElementById('remarks').value.toLowerCase(),
        // 完成交件開始（日期範圍起）
        deliveryStart: document.getElementById('deliveryStart').value,
        // 完成交件結束（日期範圍迄）
        deliveryEnd: document.getElementById('deliveryEnd').value,
        // 試戴交件開始（日期範圍起）
        tryInStart: document.getElementById('tryInStart').value,
        // 試戴交件結束（日期範圍迄）
        tryInEnd: document.getElementById('tryInEnd').value,
        // 是否過濾「重製工單」（布林值勾選）
        remake: document.getElementById('remake').checked,
        // 是否過濾「不計價」（布林值勾選）
        noCharge: document.getElementById('noCharge').checked,
        // 是否過濾「暫停」（布林值勾選）
        pause: document.getElementById('pause').checked,
        // 是否過濾「作廢」（布林值勾選）
        cancel: document.getElementById('cancel').checked
    };

    // 套用過濾邏輯，對 originalData 資料陣列做條件篩選
    filteredData = originalData.filter(item => {
        // 過濾：技工單號（模糊比對 workOrderNum）
        if (filters.jobId && !item.workOrderNum?.toLowerCase().includes(filters.jobId)) return false;
        // 過濾：醫生姓名（模糊比對 docName）
        if (filters.doctor && !item.docName?.toLowerCase().includes(filters.doctor)) return false;
        // 過濾：患者姓名（模糊比對 patientName）
        if (filters.patientName && !item.patientName?.toLowerCase().includes(filters.patientName)) return false;
        // 過濾：齒位（模糊比對 toothPosition）
        if (filters.toothPosition && !item.toothPosition?.toLowerCase().includes(filters.toothPosition)) return false;

        // 過濾：產品名稱（prodItem 與 prodName 合併後模糊比對）
        if (filters.productName) {
            const productText = (item.prodItem + ' ' + (item.prodName || '')).toLowerCase();
            if (!productText.includes(filters.productName)) return false;
        }

        // 過濾：工單現況（模糊比對 workOrderStatus）
        if (filters.currentStatus && !item.workOrderStatus?.toLowerCase().includes(filters.currentStatus)) return false;

        // 過濾：備註與狀態標籤（合併文字模糊比對）
        if (filters.remarks) {
            const statusTags = [
                item.isRemake && '重製',
                item.isNoCharge && '不計價',
                item.isPaused && '暫停',
                item.isVoided && '作廢'
            ].filter(Boolean).join('、');
            const remarksText = ((item.remarks || '') + ' ' + statusTags).toLowerCase();
            if (!remarksText.includes(filters.remarks)) return false;
        }

        // 過濾：完成交件日期在指定範圍內
        if (!isDateInRange(item.deliveryDate, filters.deliveryStart, filters.deliveryEnd)) return false;
        // 過濾：試戴交件日期在指定範圍內
        if (!isDateInRange(item.tryInDate, filters.tryInStart, filters.tryInEnd)) return false;

        // 過濾：勾選了「重製工單」但該筆資料未標記為 isRemake
        if (filters.remake && !item.isRemake) return false;
        // 過濾：勾選了「不計價」但該筆資料未標記為 isNoCharge
        if (filters.noCharge && !item.isNoCharge) return false;
        // 過濾：勾選了「暫停」但該筆資料未標記為 isPaused
        if (filters.pause && !item.isPaused) return false;
        // 過濾：勾選了「作廢」但該筆資料未標記為 isVoided
        if (filters.cancel && !item.isVoided) return false;

        // 所有條件都通過，保留這筆資料
        return true;
    });

    renderTable(filteredData); // 顯示過濾結果
}

// 重設功能
function resetFilters() {
    document.querySelectorAll('.sidebar input, .sidebar select').forEach(element => {
        if (element.type === 'checkbox') {
            element.checked = false; // 勾選框取消勾選
        } else {
            element.value = ''; // 清空欄位
        }
    });

    filteredData = [...originalData]; // 回復原始資料
    renderTable(filteredData); // 重新顯示表格
}

// ===== 修改 initializeData 函數 =====
// 找到現有的 initializeData 函數，完全替換為：

async function initializeData() {
    const tbody = document.getElementById("dataBody");
    if (!tbody) {
        console.error("找不到 dataBody 元素");
        return;
    }

    // 顯示載入中
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">資料載入中...</td></tr>`;

    try {
        // 初始化存儲系統
        const storageReady = await nldStorage.init();
        console.log('存儲系統狀態:', storageReady ? 'IndexedDB' : 'localStorage備用');

        // 從存儲中獲取數據
        const data = await nldStorage.getData();

        if (data) {
            console.log("成功從存儲獲取資料，筆數:", Array.isArray(data) ? data.length : "非陣列格式");

            originalData = Array.isArray(data) ? data : [];
            filteredData = [...originalData];

            if (originalData.length > 0) {
                console.log("第一筆資料樣本:", originalData[0]);
            }

            renderTable(filteredData);
            console.log("資料載入完成！");
        } else {
            console.log("存儲中沒有資料");
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: orange;">找不到資料，請重新登入或聯繫管理員</td></tr>`;
        }
    } catch (error) {
        console.error("初始化過程中發生錯誤:", error);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: red;">資料載入失敗，請重新整理頁面</td></tr>`;
    }
}


// ===== 修改 DOMContentLoaded 事件監聽器 =====
// 找到現有的 window.addEventListener("DOMContentLoaded", ...)
// 完全替換為以下版本：

window.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM載入完成，開始初始化...");

    // 初始化資料（這會自動初始化存儲系統）
    await initializeData();

    // 綁定事件監聽器
    const filterBtn = document.getElementById('filterBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (filterBtn) {
        filterBtn.addEventListener('click', filterData);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    // 為所有輸入框添加 Enter 鍵觸發查詢功能
    document.querySelectorAll('.sidebar input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterData();
            }
        });
    });

    console.log("所有事件監聽器綁定完成");
});

// ===== 添加緊急清理功能 =====
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