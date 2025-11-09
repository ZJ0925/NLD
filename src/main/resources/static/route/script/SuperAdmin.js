// ==================== 全域變數 ====================
let accessToken = null;
let userInfo = null;

// API 基礎路徑
const API_BASE_URL = `${window.location.protocol}//${window.location.host}`;

// ==================== LINE LIFF 驗證 ====================
async function initLIFFAuth() {
    try {

        await liff.init({
            // liffId: '2008232728-q8g8MrgK' // 佈署時註解
            liffId: '2008239415-PbvBolRD' // 開發時註解
        });


        if (!liff.isLoggedIn()) {
            console.log('⚠️ 未登入，準備跳轉到 LINE 登入頁面...');
            const redirectUri = window.location.origin + window.location.pathname;
            console.log('⚠️ Redirect URI:', redirectUri);

            liff.login({ redirectUri: redirectUri });
            return null;
        }

        accessToken = liff.getAccessToken();

        const profile = await liff.getProfile();

        userInfo = {
            accessToken: accessToken,
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl
        };

        return userInfo;

    } catch (error) {
        console.error('❌ LIFF 初始化錯誤:', error);
        showMessage('登入失敗', 'error');
        throw error;
    }
}

// ==================== 驗證超級管理員權限 ====================
async function verifyAdminPermission() {
    try {

        const response = await fetch(`${API_BASE_URL}/RoleManager/admin`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        // 嘗試讀取回應內容
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            const textData = await response.text();
            console.log('  - Response Text:', textData);
        }

        if (response.ok) {
            return true;
        } else {
            console.log('❌ 驗證失敗 - Status:', response.status);
            showUnauthorizedPage();
            return false;
        }

    } catch (error) {
        console.error('❌ 權限驗證發生錯誤:', error);
        showUnauthorizedPage();
        return false;
    }
}

// 顯示無權限頁面
function showUnauthorizedPage() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #00a19c 0%, #008b87 100%);
            padding: 20px;
        ">
            <div style="
                background: white;
                padding: 60px 40px;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                max-width: 500px;
            ">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="#ff4d4f" style="margin-bottom: 30px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h1 style="color: #ff4d4f; font-size: 28px; margin-bottom: 16px;">無權限訪問</h1>
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    抱歉，您不是超級管理員，無法訪問此頁面。<br>
                    請聯繫系統管理員取得權限。
                </p>
                <button onclick="liff.logout(); window.location.reload()" style="
                    background: #00a19c;
                    color: white;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    重新登入
                </button>
            </div>
        </div>
    `;
}

// 顯示訊息提示
function showMessage(message, type = 'success') {
    const existingMsg = document.querySelector('.status-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 載入所有管理員
async function loadAllAdmins() {
    try {
        const response = await fetch(`${API_BASE_URL}/RoleManager/getAll`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            throw new Error(`載入失敗: ${response.status}`);
        }

        const admins = await response.json();


        displayAdmins(admins);

    } catch (error) {
        console.error('載入管理員列表錯誤:', error);
        document.getElementById('adminList').innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>載入失敗,請重新整理頁面</p>
            </div>
        `;
    }
}

// 顯示管理員列表
function displayAdmins(admins) {
    const adminList = document.getElementById('adminList');

    if (!admins || admins.length === 0) {
        adminList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p>目前沒有管理員資料</p>
            </div>
        `;
        return;
    }

    adminList.innerHTML = admins.map(admin => `
        <div class="admin-item">
            <div class="admin-info">
                <div class="info-item">
                    <span class="info-label">Line ID</span>
                    <span class="info-value">${admin.lineID || '未設定'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Line 名稱</span>
                    <span class="info-value">${admin.lineName || '未設定'}</span>
                </div>
            </div>
            <button class="btn-delete" onclick="deleteAdmin('${admin.lineID}')" title="刪除管理員">
                ✕
            </button>
        </div>
    `).join('');
}

// 新增管理員
async function addAdmin() {
    const lineID = document.getElementById('lineID').value.trim();
    const lineName = document.getElementById('lineName').value.trim();

    if (!lineID || !lineName) {
        showMessage('請填寫完整資料', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/RoleManager/created`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                lineID: lineID,
                lineName: lineName
            })
        });

        if (!response.ok) {
            throw new Error(`新增失敗: ${response.status}`);
        }

        showMessage('新增成功！', 'success');

        // 清空輸入框
        document.getElementById('lineID').value = '';
        document.getElementById('lineName').value = '';

        // 重新載入列表
        await loadAllAdmins();

    } catch (error) {
        console.error('新增管理員錯誤:', error);
        showMessage('新增失敗，請稍後再試', 'error');
    }
}

// 刪除管理員
async function deleteAdmin(lineID) {
    if (!confirm('確定要刪除此管理員嗎？')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/RoleManager/${lineID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            throw new Error(`刪除失敗: ${response.status}`);
        }

        showMessage('刪除成功！', 'success');

        // 重新載入列表
        await loadAllAdmins();

    } catch (error) {
        console.error('刪除管理員錯誤:', error);
        showMessage('刪除失敗，請稍後再試', 'error');
    }
}

// 初始化 - 三步驟驗證流程
(async () => {
    try {

        // 第一步：LIFF 登入驗證
        const auth = await initLIFFAuth();

        if (auth) {

            // 第二步：驗證超級管理員權限
            const hasPermission = await verifyAdminPermission();

            if (hasPermission) {
                await loadAllAdmins();

            } else {
                console.log('步驟 2: ❌ 權限驗證失敗');
            }
        } else {
            console.log('步驟 1: ⏳ 正在跳轉登入...');
        }
    } catch (error) {
        console.error('❌ 初始化錯誤:', error);
        showMessage('系統初始化失敗', 'error');
    }
})();

// Enter 鍵快速新增
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('#lineID, #lineName');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addAdmin();
            }
        });
    });
});