document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('input_2');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', function (event) {
        event.preventDefault(); // 阻止表單預設送出

        // 個別取得欄位資料
        const hospital = document.getElementById('input_121').value.trim();
        const doctor = document.getElementById('input_122').value.trim();
        const patient = document.getElementById('input_123').value.trim();
        const nextvisit = document.getElementById('input_61').value;

        // 檢查是否填寫
        if (!hospital || !doctor || !patient || !nextvisit) {
            alert("請完整填寫所有欄位！");
            return;
        }

        // 組成 JSON 物件
        const formData = {
            hospital: hospital,
            doctor: doctor,
            patient: patient,
            nextvisit: nextvisit
        };

        // 傳送到同一個 API
        fetch('http://localhost:8080/form/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) throw new Error("提交失敗");
                return response.json();
            })
            .then(data => {
                alert("表單提交成功！");
                console.log("伺服器回傳：", data);
            })
            .catch(error => {
                alert("發生錯誤：" + error.message);
                console.error(error);
            });
    });
});
