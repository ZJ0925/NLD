package com.zj.nld.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.zj.nld.dao.JpaRepository.FormRepository;
import com.zj.nld.model.Form;
import com.zj.nld.service.LineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class LineServiceImpl implements LineService {

    @Autowired
    private FormRepository formRepository;
    // LINE 的存取權杖（請換成你自己的）
    private final String TOKEN = "PWSjC+f6Id6azivlM+Gcff99o/i8MrOhfkz94RG037SesKvUqZL2qk+C3bHicUtZiSv1+r54w2KfnC9pfMjR1MnvuGOeAezNrzT040PZhVX/XYGMffMYY8M1Och+4dL7lCIvRYj/13rZ1T0NnRCcagdB04t89/1O/w1cDnyilFU=";
    // 儲存每個使用者的輸入資料
    private final Map<String, Map<String, String>> userInput = new HashMap<>();
    // 儲存每個使用者目前的輸入狀態
    private final Map<String, String> userState = new HashMap<>();

    @Override
    public String processWebhook(String requestBody) {
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
                        // 取得發送訊息的用戶 ID
                        String userId = event.getJSONObject("source").getString("userId");

                        System.out.println("群組ID :" + groupId);
                        System.out.println("userId :" + userId);

                        // 處理不同類型的訊息
                        if ("image".equals(msgOrPic)) {
                            // 如果收到圖片訊息，可以在這裡添加處理邏輯

                        } else if ("text".equals(msgOrPic)) {
                            String messageText = event.getJSONObject("message").getString("text");
                            String response = handleUserInput(userId, messageText);
                            sendReply(replyToken, response);
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

    private String handleUserInput(String userId, String text) {
        userInput.putIfAbsent(userId, new HashMap<>());
        String state = userState.getOrDefault(userId, "idle");


        // 新增「取消查詢」邏輯
        if ("取消查詢".equals(text.trim())) {
            userInput.remove(userId);
            userState.remove(userId);
            return "已取消查詢流程，如需重新開始，請輸入「查詢表單」。";
        }

        // 🟡 尚未開始填寫流程時
        if ("idle".equals(state)) {
            if ("查詢表單".equals(text.trim())) {
                userState.put(userId, "waiting_hospital");
                return "請輸入醫院名稱：";
            } else {
                return null;
            }
        }

        // 🔁 三步驟流程
        switch (state) {
            case "waiting_hospital":
                userInput.get(userId).put("hospital", text.trim());
                userState.put(userId, "waiting_doctor");
                return "請輸入醫師姓名：";

            case "waiting_doctor":
                userInput.get(userId).put("doctor", text.trim());
                userState.put(userId, "waiting_patient");
                return "請輸入病患姓名：";

            case "waiting_patient":
                userInput.get(userId).put("patient", text.trim());
                userState.remove(userId);
                Map<String, String> data = userInput.remove(userId);

                String url = String.format(
                        "http://localhost:8080/NLDquery.html?hospital=%s&doctor=%s&patient=%s",
                        encode(data.get("hospital")),
                        encode(data.get("doctor")),
                        encode(data.get("patient"))
                );
                Form form = formRepository.findByHospitalAndDoctorAndPatient(data.get("hospital"), data.get("doctor"), data.get("patient"));
                if(form == null){
                    return "查無此表單";
                }else{
                    return "請點擊以下連結查詢表單：\n" + url;
            }
            default:
                return null;
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    //回覆訊息
    private void sendReply(String replyToken, String message) {
        // 若回覆內容為空，則不送出
        if (message == null || message.trim().isEmpty()) {
            return;
        }

        String REPLY_URL = "https://api.line.me/v2/bot/message/reply";
        RestTemplate rest = new RestTemplate();


        //設定header
        HttpHeaders headers = new HttpHeaders();
        //將LINE token置入header
        headers.setBearerAuth(TOKEN);
        //設定為JSON格式
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("replyToken", replyToken);

        Map<String, String> msg = new HashMap<>();
        //格視為文字
        msg.put("type", "text");
        //回覆文字
        msg.put("text", message);
        //將鎖鑰回覆的文字放入body
        body.put("messages", List.of(msg));


        //送出
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        rest.postForEntity(REPLY_URL, request, String.class);
    }
}
