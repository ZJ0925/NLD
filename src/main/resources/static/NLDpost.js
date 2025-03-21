// 確保你的表單有 id="fromInfo"
const form = document.getElementById('fromInfo');

// 當表單提交時，防止默認行為（即刷新頁面）
form.addEventListener('submit', function(event) {
    event.preventDefault();

    // 收集表單數據
    const formData = {
        hospital: document.getElementById('input_121').value, // 醫院
        doctor: document.getElementById('input_122').value,  // 醫生
        patient: document.getElementById('input_123').value, // 病患
        nextvisit: document.getElementById('input_61').value  // 下次約診日
    };

    // 發送 POST 請求到後端
    fetch("/form/submit", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // 設置請求的內容為 JSON
        },
        body: JSON.stringify(formData)  // 將表單數據轉換為 JSON 字符串
    })
        .then(response => {
            if (response.ok) {
                return response.json();  // 回應成功時解析 JSON
            } else {
                throw new Error('表單提交失敗');
            }
        })
        .then(data => {
            console.log('Success:', data);
            // 根據後端回應執行操作，例如顯示成功訊息
            alert('表單提交成功');
        })
        .catch((error) => {
            console.error('Error:', error);
            // 顯示錯誤訊息
            alert('提交失敗，請稍後再試');
        });
});
