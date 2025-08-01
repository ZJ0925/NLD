// 原始資料存儲
let originalData = []; // 儲存未過濾的原始資料
let filteredData = []; // 儲存過濾後的資料

// 格式化日期顯示
function formatDate(dateStr) {
    if (!dateStr) return ''; // 若為空值則回傳空字串
    const date = new Date(dateStr); // 建立日期物件
    return date.toLocaleDateString('zh-TW', { // 回傳中文格式的日期
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 渲染一列資料
function renderRow(dto) {
    const statusTags = [ // 根據布林值顯示狀態標籤
        dto.isRemake && '重製',
        dto.isNoCharge && '不計價',
        dto.isPaused && '暫停',
        dto.isVoided && '作廢'
    ].filter(Boolean).join('、'); // 移除 false 並用逗號連接

    const remarksWithStatus = [dto.remarks, statusTags].filter(Boolean).join(' '); // 合併備註與狀態標籤

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

// 初始化頁面資料
function initializeData() {
    const raw = localStorage.getItem("nldData"); // 從 localStorage 取得資料
    if (!raw) {
        document.getElementById("dataBody").innerHTML =
            `<tr><td colspan="9" style="text-align:center; color: red;">找不到資料，請重新登入</td></tr>`;
        return;
    }

    try {
        const data = JSON.parse(raw); // 解析 JSON
        originalData = Array.isArray(data) ? data : []; // 確保為陣列格式
        filteredData = [...originalData];
        renderTable(filteredData); // 顯示初始資料
    } catch (e) {
        console.error("資料格式錯誤:", e);
        document.getElementById("dataBody").innerHTML =
            `<tr><td colspan="9" style="text-align:center; color: red;">資料格式錯誤，請重新登入</td></tr>`;
    }
}

// 頁面載入時初始化
window.addEventListener("DOMContentLoaded", () => {
    initializeData(); // 載入資料

    document.getElementById('filterBtn').addEventListener('click', filterData); // 查詢按鈕
    document.getElementById('resetBtn').addEventListener('click', resetFilters); // 重設按鈕

    document.querySelectorAll('.sidebar input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterData(); // Enter 鍵觸發查詢
            }
        });
    });
});