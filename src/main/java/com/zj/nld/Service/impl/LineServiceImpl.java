package com.zj.nld.Service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.zj.nld.Model.Form;
import com.zj.nld.Model.UserGroupRole;
import com.zj.nld.Service.FormService;
import com.zj.nld.Service.JwtService;
import com.zj.nld.Service.LineService;
import com.zj.nld.Service.PermissionService;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class LineServiceImpl implements LineService {


    private final FormService formService;

    // JWT服務
    private final JwtService jwtService;

    //權限服務
    private final PermissionService permissionService;



    public LineServiceImpl(FormService formService, JwtService jwtService, PermissionService permissionService) {
        this.formService = formService;
        this.jwtService = jwtService;
        this.permissionService = permissionService;
    }

    // LINE 的存取權杖（請換成你自己的）
    private final String TOKEN = "PWSjC+f6Id6azivlM+Gcff99o/i8MrOhfkz94RG037SesKvUqZL2qk+C3bHicUtZiSv1+r54w2KfnC9pfMjR1MnvuGOeAezNrzT040PZhVX/XYGMffMYY8M1Och+4dL7lCIvRYj/13rZ1T0NnRCcagdB04t89/1O/w1cDnyilFU=";


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
                            String response = handleUserInput(userId, groupId, messageText);
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

    private String handleUserInput(String userId, String groupId, String text) {
        if (text.equals("表單查詢"))
        {
            int roleID = permissionService.getRoleId(userId, groupId).getRoleID();

            return Integer.toString(roleID);
        }else{
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
