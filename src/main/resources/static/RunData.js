window.onload = () => {
    const tbody = document.getElementById("dataBody");
    data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${row.jobId}</td>
      <td>${row.hospital}</td>
      <td>${row.doctor}</td>
      <td>${row.patient}</td>
      <td>${row.receiveDate}</td>
      <td>${row.finishDate}</td>
      <td>${row.sales}</td>
      <td>${row.position}</td>
      <td>${row.product}</td>
      <td>${row.testDate}</td>
      <td>${row.expectedFinish}</td>
      <td>${row.assign}</td>
      <td>${row.status}</td>
    `;
        tbody.appendChild(tr);
    });
};

function renderTable(filteredData) {
    const tbody = document.getElementById("dataBody");
    tbody.innerHTML = ""; // 清空舊資料

    filteredData.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${row.jobId}</td>
      <td>${row.hospital}</td>
      <td>${row.doctor}</td>
      <td>${row.patient}</td>
      <td>${row.receiveDate}</td>
      <td>${row.finishDate}</td>
      <td>${row.sales}</td>
      <td>${row.position}</td>
      <td>${row.product}</td>
      <td>${row.testDate}</td>
      <td>${row.expectedFinish}</td>
      <td>${row.assign}</td>
      <td>${row.status}</td>
    `;
        tbody.appendChild(tr);
    });
}

// 預設先顯示全部
window.onload = () => {
    renderTable(data);

    document.getElementById("filterBtn").addEventListener("click", () => {
        const jobId = document.getElementById("jobId").value.trim();
        const patient = document.getElementById("patientName").value.trim();
        const hospital = document.getElementById("hospital").value;
        const doctor = document.getElementById("doctor").value;
        const sales = document.getElementById("sales").value;

        // 日期欄位
        const receiveStart = document.getElementById("receiveStart").value;
        const receiveEnd = document.getElementById("receiveEnd").value;
        const testStart = document.getElementById("testStart").value;
        const testEnd = document.getElementById("testEnd").value;
        const expectedStart = document.getElementById("expectedStart").value;
        const expectedEnd = document.getElementById("expectedEnd").value;
        const productStart = document.getElementById("productStart").value;
        const productEnd = document.getElementById("productEnd").value;

        // 日期轉換函數
        function parseDate(str) {
            if (!str) return null;
            return new Date(str.replaceAll("/", "-"));
        }

        const filtered = data.filter(row => {
            const receiveDate = parseDate(row.receiveDate);
            const testDate = parseDate(row.testDate);
            const expectedDate = parseDate(row.expectedFinish);
            const productDate = parseDate(row.finishDate); // 對應試戴收件日

            return (
                (!jobId || row.jobId.includes(jobId)) &&
                (!patient || row.patient.includes(patient)) &&
                (!hospital || row.hospital === hospital) &&
                (!doctor || row.doctor === doctor) &&
                (!sales || row.sales === sales) &&

                (!receiveStart || (receiveDate && receiveDate >= new Date(receiveStart))) &&
                (!receiveEnd || (receiveDate && receiveDate <= new Date(receiveEnd))) &&
                (!testStart || (testDate && testDate >= new Date(testStart))) &&
                (!testEnd || (testDate && testDate <= new Date(testEnd))) &&
                (!expectedStart || (expectedDate && expectedDate >= new Date(expectedStart))) &&
                (!expectedEnd || (expectedDate && expectedDate <= new Date(expectedEnd))) &&
                (!productStart || (productDate && productDate >= new Date(productStart))) &&
                (!productEnd || (productDate && productDate <= new Date(productEnd)))
            );
        });

        renderTable(filtered);
    });


    document.getElementById("resetBtn").addEventListener("click", () => {
        document.getElementById("jobId").value = "";
        document.getElementById("patientName").value = "";
        document.getElementById("hospital").value = "";
        document.getElementById("doctor").value = "";
        document.getElementById("sales").value = "";
        document.getElementById("receiveStart").value = "";
        document.getElementById("receiveEnd").value = "";
        document.getElementById("testStart").value = "";
        document.getElementById("testEnd").value = "";
        document.getElementById("expectedStart").value = "";
        document.getElementById("expectedEnd").value = "";
        document.getElementById("productStart").value = "";
        document.getElementById("productEnd").value = "";
        renderTable(data);
    });
};


