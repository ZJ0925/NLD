document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);

    const hospital = params.get("hospital");
    const doctor = params.get("doctor");
    const patient = params.get("patient");

    if (!hospital || !doctor || !patient) return;

    // 呼叫後端 API 拿資料
    fetch(`/form/getform?hospital=${hospital}&doctor=${doctor}&patient=${patient}`)
        .then(response => {
            if (!response.ok) throw new Error("找不到資料");
            return response.json();
        })
        .then(data => {
            document.getElementById('input_121').value = data.hospital;
            document.getElementById('input_122').value = data.doctor;
            document.getElementById('input_123').value = data.patient;
            document.getElementById('input_61').value = data.nextvisit;
        })
        .catch(err => {
            alert("查詢錯誤：" + err.message);
        });
});
