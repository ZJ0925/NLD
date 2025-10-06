// ===== 在 ProdUnitScript.js 開頭添加存儲類 =====
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
            <td>${dto.clinicName || ''}</td> <!-- 醫院名稱 -->
            <td>${dto.docName || ''}</td> <!-- 醫生姓名 -->
            <td>${dto.patientName || ''}</td> <!-- 患者姓名 -->
            <td>${formatDate(dto.receivedDate)}</td> <!-- 收件日 -->
            <td>${formatDate(dto.deliveryDate)}</td> <!-- 完成交件 -->
            <td>${dto.salesName || ''}</td> <!-- 業務人員 -->
            <td>${dto.toothPosition || ''}</td> <!-- 齒位 -->
            <td>${formatDate(dto.tryInDate)}</td> <!-- 試戴交件 -->
            <td>${formatDate(dto.estFinishDate)}</td> <!-- 預計完成日 -->
            <td>${formatDate(dto.estTryInDate)}</td> <!-- 預計試戴日 -->
            <td>${dto.taskType || ''}</td> <!-- 派工別 -->
            <td>${dto.workOrderStatus || ''}</td> <!-- 工單現況 -->
            <td>${formatDate(dto.tryInReceivedDate)}</td> <!-- 試戴收件日 -->
            <td><span class="status-tags">${remarksWithStatus}</span></td> <!-- 備註與狀態 -->
        </tr>
    `;
}

// 渲染整個表格
function renderTable(dataList) {
    const tbody = document.getElementById("dataBody"); // 取得表格 tbody 元素
    if (!dataList || dataList.length === 0) { // 無資料情況
        tbody.innerHTML = `<tr><td colspan="15" style="text-align:center;">查無資料</td></tr>`;
    } else {
        tbody.innerHTML = dataList.map(renderRow).join(''); // 渲染所有列
    }
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
    tbody.innerHTML = `<tr><td colspan="15" style="text-align:center;">資料載入中...</td></tr>`;

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
            tbody.innerHTML = `<tr><td colspan="15" style="text-align:center; color: orange;">找不到資料，請重新登入或聯繫管理員</td></tr>`;
        }
    } catch (error) {
        console.error("初始化過程中發生錯誤:", error);
        tbody.innerHTML = `<tr><td colspan="15" style="text-align:center; color: red;">資料載入失敗，請重新整理頁面</td></tr>`;
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

