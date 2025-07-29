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

    return `
        <tr>
            <td>${dto.workOrderNum || ''}</td>
            <td>${dto.clinicName || ''}</td>
            <td>${dto.docName || ''}</td>
            <td>${dto.patientName || ''}</td>
            <td>${formatDate(dto.receivedDate)}</td>
            <td>${formatDate(dto.deliveryDate)}</td>
            <td>${dto.toothPosition || ''}</td>
            <td>${dto.prodName || ''}</td>
            <td>${formatDate(dto.tryInDate)}</td>
            <td>${formatDate(dto.estFinishDate)}</td>
            <td>${dto.workOrderStatus || ''}</td>
            <td>${dto.currentStatus || ''}</td>
            <td>${formatDate(dto.estTryInDate)}</td>
            <td>${dto.price ? dto.price.toLocaleString() : ''}</td>
            <td>${formatDate(dto.tryInReceivedDate)}</td>
            <td>${dto.remarks || ''}</td>
            <td class="status-tags">${statusTags}</td>
        </tr>
    `;
}

// 渲染整個表格
function renderTable(dataList) {
    const tbody = document.getElementById("dataBody");
    if (!dataList || dataList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="18" style="text-align:center;">查無資料</td></tr>`;
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
        jobId: document.getElementById('jobId').value.toLowerCase(),
        hospital: document.getElementById('hospital').value.toLowerCase(),
        doctor: document.getElementById('doctor').value.toLowerCase(),
        sales: document.getElementById('sales').value.toLowerCase(),
        patientName: document.getElementById('patientName').value.toLowerCase(),
        ageMin: document.getElementById('ageMin').value,
        ageMax: document.getElementById('ageMax').value,
        gender: document.getElementById('gender').value,
        receiveStart: document.getElementById('receiveStart').value,
        receiveEnd: document.getElementById('receiveEnd').value,
        testStart: document.getElementById('testStart').value,
        testEnd: document.getElementById('testEnd').value,
        expectedStart: document.getElementById('expectedStart').value,
        expectedEnd: document.getElementById('expectedEnd').value,
        productStart: document.getElementById('productStart').value,
        productEnd: document.getElementById('productEnd').value,
        itemType: document.getElementById('itemType').value,
        groupType: document.getElementById('groupType').value,
        remake: document.getElementById('remake').checked,
        noCharge: document.getElementById('noCharge').checked,
        modify: document.getElementById('modify').checked,
        pause: document.getElementById('pause').checked,
        cancel: document.getElementById('cancel').checked,
        listAll: document.getElementById('listAll').checked,
        personal: document.getElementById('personal').checked
    };

    filteredData = originalData.filter(item => {
        // 文字欄位過濾
        if (filters.jobId && !item.workOrderNum?.toLowerCase().includes(filters.jobId)) return false;
        if (filters.hospital && !item.clinicName?.toLowerCase().includes(filters.hospital)) return false;
        if (filters.doctor && !item.docName?.toLowerCase().includes(filters.doctor)) return false;
        if (filters.sales && !item.salesIdNum?.toLowerCase().includes(filters.sales)) return false;
        if (filters.patientName && !item.patientName?.toLowerCase().includes(filters.patientName)) return false;

        // 性別過濾
        if (filters.gender && item.gender !== filters.gender) return false;

        // 年齡過濾
        if (filters.ageMin && item.age < parseInt(filters.ageMin)) return false;
        if (filters.ageMax && item.age > parseInt(filters.ageMax)) return false;

        // 日期範圍過濾
        if (!isDateInRange(item.receivedDate, filters.receiveStart, filters.receiveEnd)) return false;
        if (!isDateInRange(item.estTryInDate, filters.testStart, filters.testEnd)) return false;
        if (!isDateInRange(item.estFinishDate, filters.expectedStart, filters.expectedEnd)) return false;
        if (!isDateInRange(item.tryInReceivedDate, filters.productStart, filters.productEnd)) return false;

        // 件別和組別過濾
        if (filters.itemType && item.itemType !== filters.itemType) return false;
        if (filters.groupType && item.groupType !== filters.groupType) return false;

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
            `<tr><td colspan="18" style="text-align:center; color: red;">找不到資料，請重新登入</td></tr>`;
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
            `<tr><td colspan="18" style="text-align:center; color: red;">資料格式錯誤，請重新登入</td></tr>`;
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