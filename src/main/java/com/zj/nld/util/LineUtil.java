package com.zj.nld.util;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LINE API 工具類別
 * 提供取得使用者資料和群組資料的方法 (Static Mode)
 */
@Component
public class LineUtil {

    // LINE Bot Channel Access Token - 從 application.properties 讀取
    private static String TOKEN;

    @Value("${LineTOKEN}")
    public void setToken(String token) {
        TOKEN = token;
    }

    /**
     * 取得使用者個人資料
     * @param userId 使用者ID
     * @return JSONObject 包含 userId, displayName, pictureUrl, statusMessage, language
     */
    public static JSONObject getUserProfile(String userId) {
        String USER_PROFILE_URL = "https://api.line.me/v2/bot/profile/" + userId;
        RestTemplate rest = new RestTemplate();

        // 設定 Header
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(TOKEN);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(headers);

        JSONObject userProfile = null;
        try {
            ResponseEntity<String> response = rest.exchange(
                    USER_PROFILE_URL,
                    HttpMethod.GET,
                    request,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                userProfile = JSON.parseObject(response.getBody());
                System.out.println("使用者ID: " + userProfile.getString("userId"));
                System.out.println("顯示名稱: " + userProfile.getString("displayName"));
                System.out.println("頭像URL: " + userProfile.getString("pictureUrl"));
                System.out.println("狀態訊息: " + userProfile.getString("statusMessage"));
                System.out.println("語言設定: " + userProfile.getString("language"));
                return userProfile;
            }
        } catch (Exception e) {
            System.err.println("取得使用者資料失敗: " + e.getMessage());
        }

        return userProfile;
    }

    /**
     * 僅取得使用者顯示名稱
     * @param userId 使用者ID
     * @return 使用者顯示名稱
     */
    public static String getUserDisplayName(String userId) {
        JSONObject userProfile = getUserProfile(userId);
        if (userProfile != null) {
            return userProfile.getString("displayName");
        }
        return null;
    }

    /**
     * 僅取得使用者狀態訊息
     * @param userId 使用者ID
     * @return 使用者狀態訊息
     */
    public static String getUserStatusMessage(String userId) {
        JSONObject userProfile = getUserProfile(userId);
        if (userProfile != null) {
            return userProfile.getString("statusMessage");
        }
        return null;
    }

    /**
     * 同時取得顯示名稱和狀態訊息
     * @param userId 使用者ID
     * @return String[] 陣列，[0]=displayName, [1]=statusMessage
     */
    public static String[] getUserDisplayNameAndStatus(String userId) {
        JSONObject userProfile = getUserProfile(userId);
        if (userProfile != null) {
            String displayName = userProfile.getString("displayName");
            String statusMessage = userProfile.getString("statusMessage");
            return new String[]{displayName, statusMessage};
        }
        return null;
    }

    /**
     * 取得群組摘要資訊（包含群組名稱）
     * @param groupId 群組ID
     * @return JSONObject 包含 groupId, groupName, pictureUrl
     */
    public static JSONObject getGroupSummary(String groupId) {
        String GROUP_SUMMARY_URL = "https://api.line.me/v2/bot/group/" + groupId + "/summary";
        RestTemplate rest = new RestTemplate();

        // 設定 Header
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(TOKEN);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = rest.exchange(
                    GROUP_SUMMARY_URL,
                    HttpMethod.GET,
                    request,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                JSONObject groupSummary = JSON.parseObject(response.getBody());
                System.out.println("群組ID: " + groupSummary.getString("groupId"));
                System.out.println("群組名稱: " + groupSummary.getString("groupName"));
                System.out.println("群組頭像: " + groupSummary.getString("pictureUrl"));
                return groupSummary;
            }
        } catch (Exception e) {
            System.err.println("取得群組摘要失敗: " + e.getMessage());
        }

        return null;
    }


    /**
     * 取得群組成員 ID 列表
     * @param groupId 群組ID
     * @return 群組成員ID的List
     */
    public static List<String> getGroupUserID(String groupId) {
        List<String> userIDList = new ArrayList<>();
        String baseUrl = "https://api.line.me/v2/bot/group/" + groupId + "/members/ids";
        RestTemplate rest = new RestTemplate();

        // 設定 Header
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(TOKEN); // 確認這裡是 Messaging API 的長期 token

        String nextToken = null;

        try {
            do {
                // 如果有分頁 nextToken，要接在 query string 後面
                String requestUrl = (nextToken == null) ? baseUrl : baseUrl + "?start=" + nextToken;

                HttpEntity<String> request = new HttpEntity<>(headers);
                ResponseEntity<String> response = rest.exchange(
                        requestUrl,
                        HttpMethod.GET,
                        request,
                        String.class
                );

                if (response.getStatusCode() == HttpStatus.OK) {
                    JSONObject json = JSON.parseObject(response.getBody());

                    // 加入本批成員
                    List<String> memberIds = json.getJSONArray("memberIds").toJavaList(String.class);
                    userIDList.addAll(memberIds);

                    // 取得下一頁的 token（如果有的話）
                    nextToken = json.getString("next");
                } else {
                    System.err.println("取得群組成員失敗，HTTP 狀態碼: " + response.getStatusCode());
                    break;
                }
            } while (nextToken != null);

            return userIDList;
        } catch (Exception e) {
            System.err.println("取得群組成員失敗: " + e.getMessage());
            e.printStackTrace();
        }

        return new ArrayList<>();
    }




    /**
     * 僅取得群組名稱
     * @param groupId 群組ID
     * @return 群組名稱字串，失敗時返回 null
     */
    public static String getGroupName(String groupId) {
        JSONObject groupSummary = getGroupSummary(groupId);
        if (groupSummary != null) {
            return groupSummary.getString("groupName");
        }
        return null;
    }

    /**
     * 取得群組成員個人資料
     * @param groupId 群組ID
     * @param userId 使用者ID
     * @return JSONObject 包含 userId, displayName, pictureUrl
     */
    public static JSONObject getGroupMemberProfile(String groupId, String userId) {
        String GROUP_MEMBER_PROFILE_URL = "https://api.line.me/v2/bot/group/" + groupId + "/member/" + userId;
        RestTemplate rest = new RestTemplate();

        // 設定 Header
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(TOKEN);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(headers);

        JSONObject memberProfile = null;
        try {
            ResponseEntity<String> response = rest.exchange(
                    GROUP_MEMBER_PROFILE_URL,
                    HttpMethod.GET,
                    request,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                memberProfile = JSON.parseObject(response.getBody());
                System.out.println("群組成員ID: " + memberProfile.getString("userId"));
                System.out.println("群組內顯示名稱: " + memberProfile.getString("displayName"));
                System.out.println("群組內頭像URL: " + memberProfile.getString("pictureUrl"));
                return memberProfile;
            }
        } catch (Exception e) {
            System.err.println("取得群組成員資料失敗: " + e.getMessage());
        }

        return memberProfile;
    }

    /**
     * 僅取得群組成員顯示名稱
     * @param groupId 群組ID
     * @param userId 使用者ID
     * @return 群組內顯示名稱
     */
    public static String getGroupMemberDisplayName(String groupId, String userId) {
        JSONObject memberProfile = getGroupMemberProfile(groupId, userId);
        if (memberProfile != null) {
            return memberProfile.getString("displayName");
        }
        return null;
    }

    //回覆訊息
    public static void sendReply(String replyToken, String message) {
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