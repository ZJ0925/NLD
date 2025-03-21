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


    private boolean checkGO = false;
    public boolean checkGOwhere = false;


    //自動回複訊息
    @Override
    public void responseTOuser(String replyToken, String messageText) {
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


        //將訊息的body加入到list，再把list包裝到requestBody變成json格式
        if(checkGO == true){
            switch(messageText){
                case "1":
                    Map<String, String> home = new HashMap<>();
                    home.put("type","text");
                    home.put("text","首頁");
                    messages.add(home);
                    checkGO = false;
                    checkGOwhere = true;
                    break;
                case "2":
                    Map<String, String> doctor = new HashMap<>();
                    doctor.put("type","text");
                    doctor.put("text","請輸入醫生姓名");
                    messages.add(doctor);
                    checkGO = false;
                    checkGOwhere = true;
                    break;
                case "3":
                    Map<String, String> ClinicName = new HashMap<>();
                    ClinicName.put("type","text");
                    ClinicName.put("text","請輸入診所名稱");
                    messages.add(ClinicName);
                    checkGO = false;
                    checkGOwhere = true;
                    break;
                case "4":
                    Map<String, String> PatientsName = new HashMap<>();
                    PatientsName.put("type","text");
                    PatientsName.put("text","輸入患者名稱");
                    messages.add(PatientsName);
                    checkGO = false;
                    checkGOwhere = true;
                    break;
            }
            //如果使用者回覆go，跳到功能選單
        }else if(messageText.equals("go")){
            Map<String, String> go = new HashMap<>();
            go.put("type","text");
            go.put("text","1. 首頁\n" + "2. 輸入醫生姓名\n" + "3. 輸入診所名稱\n" + "4. 輸入患者名稱");
            messages.add(go);
            checkGO = true;
        }else {
            Map<String, String> textMessage1 = new HashMap<>();
            textMessage1.put("type", "text");
            textMessage1.put("text", messageText);
            messages.add(textMessage1);
        }


        requestBody.put("messages",messages);

        //先建立http請求再發送
        // 建立 HTTP 請求物件，包含 JSON Body 和 Headers
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // 發送 POST 請求到 LINE Messaging API 來回覆用戶
        restTemplate.postForObject(REPLY_URL, entity, String.class);
    }

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
//                            responseTOuser(replyToken, messageText);
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

    //取得群組成員ID
    @Override
    public void getGroupUsersId(String groupId) {
        System.out.println("🔹 收到 LINE Webhook，開始尋找所有用戶ID" );

    }
}
