package  com.zj.nld.service.impl;

import com.zj.nld.service.LineService;


import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.*;

@Service
public class LineServiceImpl implements LineService {

    //LINE token
    private final String Channel_Access_Token = "PWSjC+f6Id6azivlM+Gcff99o/i8MrOhfkz94RG037SesKvUqZL2qk+C3bHicUtZiSv1+r54w2KfnC9pfMjR1MnvuGOeAezNrzT040PZhVX/XYGMffMYY8M1Och+4dL7lCIvRYj/13rZ1T0NnRCcagdB04t89/1O/w1cDnyilFU=";
    // 記錄 userId → 狀態，例如："waiting_hospital_name"
    private final Map<String, String> userStateMap = new HashMap<>();

    //取得用戶回覆的訊息
    @Override
    public String processWebhook(String requestBody) {
        System.out.println("🔹 收到 LINE Webhook: " + requestBody);
        try {
            // 解析 JSON
            JSONObject jsonObject = JSON.parseObject(requestBody);
            // 從 JSON 中獲取 "events" 陣列
            JSONArray events = jsonObject.getJSONArray("events");
            // 檢查是否有 events
            if (events != null) {
                for (int i = 0; i < events.size(); i++) {
                    JSONObject event = events.getJSONObject(i);
                    // 取得事件類型，例如 "message"
                    String eventType = event.getString("type");
                    // 取得回覆 Token
                    String replyToken = event.getString("replyToken");

                    // 判斷是否為 "message" 事件
                    if ("message".equals(eventType)) {
                        // 取得 message 內容
                        JSONObject message = event.getJSONObject("message");

                        // 取得訊息類型
                        String msgOrPic = message.getString("type");

                        // 取得發送訊息的群組 ID
                        String groupId = event.getJSONObject("source").getString("groupId");
                        //顯示群組所有用戶ID
                        getGroupUsersId(groupId);
                        // 取得發送訊息的用戶 ID
                        String userId = event.getJSONObject("source").getString("userId");

                        System.out.println("群組ID :" + groupId);
                        System.out.println("userId :" + userId);

                        // 處理不同類型的訊息
                        if ("image".equals(msgOrPic)) {
                            // 如果收到圖片訊息，可以在這裡添加處理邏輯

                        } else if ("text".equals(msgOrPic)) {
                            // 取得文字訊息
                            String messageText = message.getString("text");
                            // 發送回應訊息
                            String response = keyword(userId,messageText);
                            responseTOuser(replyToken, response);
                        } else {
                            System.out.println("不合法傳入, 請傳 image 及 text");
                        }
                    }
                }
            } else {
                System.out.println("event null......不合法的傳入");
            }

        } catch (Exception e) {
            System.err.println("❌ 解析 LINE Webhook 失敗：" + e.getMessage());
        }
        return "OK";
    }


    //自動回複訊息
    @Override
    public void responseTOuser(String replyToken, String response) {
        //傳送回覆訊息API
        String REPLY_URL = "https://api.line.me/v2/bot/message/reply";
        //透過RestTemplate請求自動轉為massage(像是JDBCTemplat可以轉成sql的功能一樣)
        RestTemplate restTemplate = new RestTemplate();


        //設定header
        HttpHeaders headers = new HttpHeaders();
        //設定ContentType為JSON格式
        headers.setContentType(MediaType.APPLICATION_JSON);
        //LINE用Bearer Token 進行身份驗證
        headers.setBearerAuth(Channel_Access_Token);
        //json格式為String,Object
        Map<String, Object> requestBody = new HashMap<>();
        //擷取用戶端replyToken
        requestBody.put("replyToken",replyToken);

        //建立List可以發送多組訊息
        List<Map<String, String>> messages = new ArrayList<>();


        Map<String, String> textMessage1 = new HashMap<>();
        textMessage1.put("type", "text");
        textMessage1.put("text", response);
        messages.add(textMessage1);

        //將messages裡的東西放到requestBody，才能回覆
        requestBody.put("messages", messages); //
        //先建立http請求再發送
        // 建立 HTTP 請求物件，包含 JSON Body 和 Headers
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // 發送 POST 請求到 LINE Messaging API 來回覆用戶
        restTemplate.postForObject(REPLY_URL, entity, String.class);
    }



    //判斷是不是為關鍵字，!!!要加入查詢有沒有此人或醫院的功能
    public String keyword(String userId, String messageText) {
        String replystring = "";

        // 先看目前使用者的狀態
        String currentState = userStateMap.getOrDefault(userId, "");

        // === 狀態 1：輸入了「查詢資料」 ===
        if (messageText.equals("查詢資料")) {
            userStateMap.put(userId, "waiting_for_option");
            return "請輸入數字選項：\n1. 醫院\n2. 醫師\n3. 病患";

        }

        // === 狀態 2：使用者剛輸入選項 1/2/3 ===
        if ("waiting_for_option".equals(currentState)) {
            switch (messageText) {
                case "1":
                    userStateMap.put(userId, "waiting_hospital_name");
                    return "請輸入醫院名稱";
                case "2":
                    userStateMap.put(userId, "waiting_doctor_name");
                    return "請輸入醫師名稱";
                case "3":
                    userStateMap.put(userId, "waiting_patient_name");
                    return "請輸入病患名稱";
                default:
                    return "請輸入有效選項：1、2 或 3";
            }
        }

        // === 狀態 3：使用者輸入了 醫院名稱 ===
        if ("waiting_hospital_name".equals(currentState)) {
            // 根據輸入的醫院名稱，組出連結
            String hospitalName = messageText.trim();
            String hospitalUrl = "https://your-domain.com/hospital/" ;//+ URLEncoder.encode(hospitalName, StandardCharsets.UTF_8)

            // 清除狀態
            userStateMap.remove(userId);

            return "請點擊以下連結查看醫院資訊：\n" + hospitalUrl;
        }

        // === 狀態 4：使用者輸入了 醫師名稱 ===
        if ("waiting_doctor_name".equals(currentState)) {
            String doctorName = messageText.trim();
            String doctorUrl = "https://your-domain.com/doctor/";//+ URLEncoder.encode(doctorName, StandardCharsets.UTF_8)

            userStateMap.remove(userId);

            return "請點擊以下連結查看醫師資訊：\n" + doctorUrl;
        }

        // === 狀態 5：使用者輸入了 病患名稱 ===
        if ("waiting_patient_name".equals(currentState)) {
            String patientName = messageText.trim();
            String patientUrl = "https://your-domain.com/patient/" ;//+ URLEncoder.encode(patientName, StandardCharsets.UTF_8)

            userStateMap.remove(userId);

            return "請點擊以下連結查看病患資訊：\n" + patientUrl;
        }

        // === 預設 ===
        return replystring;
    }


    //取得群組成員ID
    @Override
    public void getGroupUsersId(String groupId) {
        System.out.println("🔹 收到 LINE Webhook，開始尋找所有用戶ID" );

    }
}
