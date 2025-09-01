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

// 新增：當使用者嘗試離開頁面或訪問其他網址時的檢查
function checkTokenBeforeNavigation() {
    const token = localStorage.getItem("jwtToken");

    if (!token || token.split('.').length !== 3) {
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
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("nldData");
            window.location.href = "/index.html";
            return false;
        }
        return true;
    } catch (e) {
        console.error("無法解析 JWT:", e);
        localStorage.removeItem("jwtToken");
        window.location.href = "/index.html";
        return false;
    }
}

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

// 從API獲取資料的函數
async function fetchDataFromAPI() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        console.error("沒有找到JWT token");
        return null;
    }

    try {
        console.log("正在從API獲取資料...");

        // 這裡需要根據你的實際API路徑調整
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
            console.log("API回應資料:", data);

            // 儲存到localStorage作為備份
            localStorage.setItem("nldData", JSON.stringify(data));
            return data;
        } else {
            console.error("API請求失敗:", response.status, response.statusText);

            // 如果API失敗，嘗試使用localStorage的備份資料
            const backupData = localStorage.getItem("nldData");
            if (backupData) {
                console.log("使用localStorage備份資料");
                return JSON.parse(backupData);
            }
            return null;
        }
    } catch (error) {
        console.error('獲取資料時發生錯誤:', error);

        // 網路錯誤時，嘗試使用localStorage的備份資料
        const backupData = localStorage.getItem("nldData");
        if (backupData) {
            console.log("網路錯誤，使用localStorage備份資料");
            return JSON.parse(backupData);
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

// 渲染列表視圖
function renderListView(dataList) {
    const listView = document.getElementById('listView');
    if (!dataList || dataList.length === 0) {
        listView.innerHTML = '<div class="loading">查無資料</div>';
    } else {
        listView.innerHTML = dataList.map(renderListItem).join('');
    }
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

// 顯示詳細資料
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
}

// 返回列表視圖
function showList() {
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

// 搜尋功能
function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

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

// 初始化資料 - 修改為使用localStorage，符合手機版架構
function initializeData() {
    console.log("開始初始化資料...");

    const listViewElement = document.getElementById("listView");
    if (!listViewElement) {
        console.error("找不到 listView 元素！");
        return;
    }

    // 先顯示載入中
    listViewElement.innerHTML = '<div class="loading">資料載入中...</div>';

    const raw = localStorage.getItem("nldData");
    if (!raw) {
        console.log("localStorage中沒有找到 nldData");
        listViewElement.innerHTML = '<div class="loading" style="color: red;">找不到資料，請重新登入</div>';
        return;
    }

    try {
        const data = JSON.parse(raw);
        console.log("成功解析localStorage資料，筆數:", Array.isArray(data) ? data.length : "非陣列格式");

        originalData = Array.isArray(data) ? data : [];
        filteredData = [...originalData];

        if (originalData.length > 0) {
            console.log("第一筆資料樣本:", originalData[0]);
        }

        renderListView(filteredData);
        console.log("資料載入完成！");
    } catch (e) {
        console.error("localStorage資料格式錯誤:", e);
        listViewElement.innerHTML = '<div class="loading" style="color: red;">資料格式錯誤，請重新登入</div>';
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

// 將 showDetail 和 jumpToDateMonth 函數設為全域函數，讓 HTML 中的 onclick 能夠呼叫
window.showDetail = showDetail;
window.jumpToDateMonth = jumpToDateMonth;