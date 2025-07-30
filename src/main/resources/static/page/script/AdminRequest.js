// 原始資料存儲
let originalData = [];
let filteredData = [];

// 格式化日期顯示
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 渲染一列資料
function renderRow(dto) {
    const statusTags = [
        dto.isRemake && '重製',
        dto.isNoCharge && '不計價',
        dto.isPaused && '暫停',
        dto.isVoided && '作廢'
    ].filter(Boolean).join('、');

    // 將狀態標籤加到備註中
    const remarksWithStatus = [dto.remarks, statusTags].filter(Boolean).join(' ');

    return `
        <tr>
            <td>${dto.workOrderNum || ''}</td>
            <td>${dto.clinicName || ''}</td>
            <td>${dto.docName || ''}</td>
            <td>${dto.patientName || ''}</td>
            <td>${formatDate(dto.receivedDate)}</td>
            <td>${formatDate(dto.deliveryDate)}</td>
            <td>${dto.salesIdNum || ''}</td>
            <td>${dto.toothPosition || ''}</td>
            <td>${dto.prodItem ? dto.prodItem + ' - ' + (dto.prodName || '') : dto.prodName || ''}</td>
            <td>${formatDate(dto.tryInDate)}</td>
            <td>${formatDate(dto.estFinishDate)}</td>
            <td>${dto.workOrderStatus || ''}</td>
            <td>${dto.currentStatus || ''}</td>
            <td>${formatDate(dto.estTryInDate)}</td>
            <td>${dto.price ? dto.price.toLocaleString() : ''}</td>
            <td>${formatDate(dto.tryInReceivedDate)}</td>
            <td><span class="status-tags">${remarksWithStatus}</span></td>
        </tr>
    `;
}

// 渲染整個表格
function renderTable(dataList) {
    const tbody = document.getElementById("dataBody");
    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="17" style="text-align:center;">查無資料</td></tr>`;
    } else {
        tbody.innerHTML = dataList.map(renderRow).join('');
    }
}

// 日期比較函數
function isDateInRange(dateStr, startDate, endDate) {
    if (!dateStr) return !startDate && !endDate;
    if (!startDate && !endDate) return true;

    const date = new Date(dateStr);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
}

// 過濾功能
function filterData() {
    const filters = {
        // 文字欄位
        jobId: document.getElementById('jobId').value.toLowerCase(),
        hospital: document.getElementById('hospital').value.toLowerCase(),
        doctor: document.getElementById('doctor').value.toLowerCase(),
        patientName: document.getElementById('patientName').value.toLowerCase(),
        sales: document.getElementById('sales').value.toLowerCase(),
        toothPosition: document.getElementById('toothPosition').value.toLowerCase(),
        productName: document.getElementById('productName').value.toLowerCase(),
        currentStatus: document.getElementById('currentStatus').value.toLowerCase(),
        remarks: document.getElementById('remarks').value.toLowerCase(),

        // 單價範圍
        priceMin: document.getElementById('priceMin').value,
        priceMax: document.getElementById('priceMax').value,

        // 日期範圍
        receiveStart: document.getElementById('receiveStart').value,
        receiveEnd: document.getElementById('receiveEnd').value,
        deliveryStart: document.getElementById('deliveryStart').value,
        deliveryEnd: document.getElementById('deliveryEnd').value,
        tryInStart: document.getElementById('tryInStart').value,
        tryInEnd: document.getElementById('tryInEnd').value,
        expectedStart: document.getElementById('expectedStart').value,
        expectedEnd: document.getElementById('expectedEnd').value,
        testStart: document.getElementById('testStart').value,
        testEnd: document.getElementById('testEnd').value,
        productStart: document.getElementById('productStart').value,
        productEnd: document.getElementById('productEnd').value,

        // 下拉選項
        workOrderStatus: document.getElementById('workOrderStatus').value,

        // 複選框
        remake: document.getElementById('remake').checked,
        noCharge: document.getElementById('noCharge').checked,
        pause: document.getElementById('pause').checked,
        cancel: document.getElementById('cancel').checked
    };

    filteredData = originalData.filter(item => {
        // 技工單號過濾
        if (filters.jobId && !item.workOrderNum?.toLowerCase().includes(filters.jobId)) return false;

        // 醫院名稱過濾
        if (filters.hospital && !item.clinicName?.toLowerCase().includes(filters.hospital)) return false;

        // 醫生姓名過濾
        if (filters.doctor && !item.docName?.toLowerCase().includes(filters.doctor)) return false;

        // 患者姓名過濾
        if (filters.patientName && !item.patientName?.toLowerCase().includes(filters.patientName)) return false;

        // 業務人員過濾
        if (filters.sales && !item.salesIdNum?.toLowerCase().includes(filters.sales)) return false;

        // 齒位過濾
        if (filters.toothPosition && !item.toothPosition?.toLowerCase().includes(filters.toothPosition)) return false;

        // 產品名稱過濾（包含 prodItem 和 prodName）
        if (filters.productName) {
            const productText = (item.prodItem + ' ' + (item.prodName || '')).toLowerCase();
            if (!productText.includes(filters.productName)) return false;
        }

        // 工單現況過濾
        if (filters.currentStatus && !item.currentStatus?.toLowerCase().includes(filters.currentStatus)) return false;

        // 備註過濾（包含狀態標籤）
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

        // 單價過濾
        if (filters.priceMin && item.price < parseFloat(filters.priceMin)) return false;
        if (filters.priceMax && item.price > parseFloat(filters.priceMax)) return false;

        // 收件日期過濾
        if (!isDateInRange(item.receivedDate, filters.receiveStart, filters.receiveEnd)) return false;

        // 完成交件日期過濾
        if (!isDateInRange(item.deliveryDate, filters.deliveryStart, filters.deliveryEnd)) return false;

        // 試戴交件日期過濾
        if (!isDateInRange(item.tryInDate, filters.tryInStart, filters.tryInEnd)) return false;

        // 預計完成日過濾
        if (!isDateInRange(item.estFinishDate, filters.expectedStart, filters.expectedEnd)) return false;

        // 預計試戴日過濾
        if (!isDateInRange(item.estTryInDate, filters.testStart, filters.testEnd)) return false;

        // 試戴收件日過濾
        if (!isDateInRange(item.tryInReceivedDate, filters.productStart, filters.productEnd)) return false;

        // 派工別過濾
        if (filters.workOrderStatus && item.workOrderStatus !== filters.workOrderStatus) return false;

        // 狀態過濾
        if (filters.remake && !item.isRemake) return false;
        if (filters.noCharge && !item.isNoCharge) return false;
        if (filters.pause && !item.isPaused) return false;
        if (filters.cancel && !item.isVoided) return false;

        return true;
    });

    renderTable(filteredData);
}

// 重設功能
function resetFilters() {
    document.querySelectorAll('.sidebar input, .sidebar select').forEach(element => {
        if (element.type === 'checkbox') {
            element.checked = false;
        } else {
            element.value = '';
        }
    });

    filteredData = [...originalData];
    renderTable(filteredData);
}

// 初始化頁面資料
function initializeData() {
    // 從 localStorage 取得資料
    const raw = localStorage.getItem("nldData");
    if (!raw) {
        document.getElementById("dataBody").innerHTML =
            `<tr><td colspan="17" style="text-align:center; color: red;">找不到資料，請重新登入</td></tr>`;
        return;
    }

    // 解析資料
    try {
        const data = JSON.parse(raw);
        originalData = Array.isArray(data) ? data : [];
        filteredData = [...originalData];
        renderTable(filteredData);
    } catch (e) {
        console.error("資料格式錯誤:", e);
        document.getElementById("dataBody").innerHTML =
            `<tr><td colspan="17" style="text-align:center; color: red;">資料格式錯誤，請重新登入</td></tr>`;
    }
}

// 頁面載入時初始化
window.addEventListener("DOMContentLoaded", () => {
    initializeData();

    // 綁定查詢按鈕
    document.getElementById('filterBtn').addEventListener('click', filterData);

    // 綁定重設按鈕
    document.getElementById('resetBtn').addEventListener('click', resetFilters);

    // 綁定輸入欄位的 Enter 鍵
    document.querySelectorAll('.sidebar input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterData();
            }
        });
    });
});