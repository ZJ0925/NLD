package com.zj.nld.Service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Service.*;
import com.zj.nld.util.LineUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LineServiceImpl implements LineService {
    // ngrok開啟網址：ngrok http --domain=bengal-charming-hyena.ngrok-free.app 8080
    private  static String ngrokURL;

    @Value("${NgrokURL}")
    public static void setNgrokURL(String ngrokURL) {
        LineServiceImpl.ngrokURL = ngrokURL;
    }

    // 表單網址
    private static String url;

    @Value("${URL}")
    public static void setUrl(String url) {
        LineServiceImpl.url = url;
    }

    // Admin的權限管理網址
    private static String adminURL;

    @Value("${AdminURL}")
    public static void setAdminURL(String adminURL) {
        LineServiceImpl.adminURL = adminURL;
    }

    // JWT服務
    private final JwtService jwtService;

    // 使用者權限服務
    private final UserGroupRoleService userGroupRoleService;

    public LineServiceImpl(JwtService jwtService, UserGroupRoleService userGroupRoleService) {
        this.jwtService = jwtService;
        this.userGroupRoleService = userGroupRoleService;
    }


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

                    //
                    JSONObject event = events.getJSONObject(i);

                    // 取得事件類型，例如 "message"
                    String eventType = event.getString("type");
                    System.out.println("動作類型: " + eventType);

                    String groupId = event.getJSONObject("source").getString("groupId");

                    String userId = event.getJSONObject("source").getString("userId");

                    // 取得回覆 Token
                    String replyToken = event.getString("replyToken");


                    switch (eventType)
                    {
                        // 類型為訊息
                        case "message" :
                            //----------------------------message--------------------------------------------------
                            // 取得 message 內容
                            JSONObject message = event.getJSONObject("message");
                            // 取得訊息類型
                            String msgOrPic = message.getString("type");

                            // 一次取得所需資訊
                            String userDisplayName = LineUtil.getUserDisplayName(userId);
                            String groupName = LineUtil.getGroupName(groupId);
                            //------------------------------------------------------------------------------

                            // 處理不同類型的訊息
                            if ("image".equals(msgOrPic)) {
                                // 如果收到圖片訊息，可以在這裡添加處理邏輯

                            } else if ("text".equals(msgOrPic)) {
                                String messageText = event.getJSONObject("message").getString("text");
                                System.out.println("發出訊息: " + messageText);
                                String response = handleUserInput(userId, groupId, messageText);
                                LineUtil.sendReply(replyToken, response);
                            } else {
                                System.out.println("不合法傳入, 請傳 image 及 text");
                            }
                            break;

                        case "memberLeft" :
                            String leftGroupId = event.getJSONObject("source").getString("groupId");
                            System.out.println("離開群組ID: " + leftGroupId);

                            // 取得 left 區塊
                            JSONObject left = event.getJSONObject("left");
                            // 取得 members 陣列
                            JSONArray members = left.getJSONArray("members");

                            // 取出每一個 member
                            for (int j = 0; j < members.size(); j++) {
                                JSONObject leftMember = members.getJSONObject(j);
                                String leftUserId = leftMember.getString("userId");
                                System.out.println("離開的使用者 ID: " + leftUserId);
                                deleteRole(leftUserId, leftGroupId);
                            }
                            break;

                        case "memberJoined" :
                            String joinGroupId = event.getJSONObject("source").getString("groupId");
                            System.out.println("加入群組ID: " + joinGroupId);

                            // 取得 joined 區塊
                            JSONObject joined = event.getJSONObject("joined");
                            // 取得 members 陣列
                            JSONArray joinMembers = joined.getJSONArray("members");

                            // 取出每一個 member
                            for (int j = 0; j < joinMembers.size(); j++) {
                                JSONObject member = joinMembers.getJSONObject(j);
                                String joinUserId = member.getString("userId");

                                JSONObject groupProfile = LineUtil.getGroupSummary(groupId);
                                JSONObject userProfile = LineUtil.getGroupMemberProfile(groupId, joinUserId);



                                // 關鍵修正：為每個新成員創建新的 UserGroupRole 物件
                                UserGroupRole mjUserGroupRole = new UserGroupRole();
                                mjUserGroupRole.setExternalID(UUID.randomUUID());
                                mjUserGroupRole.setLineID(joinUserId);
                                mjUserGroupRole.setUserName(userProfile.getString("displayName"));
                                mjUserGroupRole.setGroupID(joinGroupId);
                                mjUserGroupRole.setGroupName(groupProfile.getString("groupName"));
                                mjUserGroupRole.setRoleID(2);
                                System.out.println("加入的使用者 ID: " + joinUserId);

                                try {
                                    userGroupRoleService.ceateUserGroupRole(mjUserGroupRole);
                                    System.out.println("成功為使用者 " + joinUserId + " 建立權限");
                                } catch (Exception e) {
                                    System.err.println("為使用者 " + joinUserId + " 建立權限失敗: " + e.getMessage());
                                }
                            }

                        //機器人加入群組(先不實作)
                        case "join" :
                            List<String> userIdList =  LineUtil.getGroupUserID(groupId);
                            System.out.println("1111111:  " + userIdList);
                            UserGroupRole joinGroupRole = new UserGroupRole();


                            System.out.println("加入到新的群組");
                            break;

                        case "leave" :
                            String leaveGroupId = event.getJSONObject("source").getString("groupId");
                            System.out.println("groupId: " + leaveGroupId);
                            userGroupRoleService.deleteGroupRoleByGroupID(leaveGroupId);
                            break;

                        default :
                            break;
                    }
                }
            } else {
                System.out.println("event null......不合法的傳入");
            }

        } catch (Exception e) {
            System.err.println("⚠ 解析 LINE Webhook 失敗： " + e.getMessage());
        }
        return "OK";
    }

    // 紀錄每個使用者目前的對話狀態，例如是否在等待輸入新群組名稱
    HashMap<String, String> userState = new HashMap<>();

    private String handleUserInput(String userId, String groupId, String text) {
        // 取得使用者目前的狀態，預設是 "default"
        String state = userState.getOrDefault(userId, "default");
        UserGroupRole userGroupRole = new UserGroupRole();
        boolean updateResult = false;

        if ("表單查詢".equals(text)) {
            // 先透過 userId 和 groupId 查詢該使用者在該群組的權限
            UserGroupRole fUserGroupRole = userGroupRoleService.getRoleId(userId, groupId);
            UserGroupRole fGroupRole = userGroupRoleService.getGroupRoleByGroupID(groupId);

            if (fUserGroupRole != null && fGroupRole != null) {
                // 如果找到權限，判斷 RoleID 是否為 0 (無權限)
                if (fGroupRole.getRoleID() == 0) {
                    return "尚無權限或查詢權限尚未開啟";
                }
                // 產生 JWT token 並組成查詢網址回傳
                String token = jwtService.generateToken(userId, groupId, fUserGroupRole.getRoleID());
                return url + token;
            }

            // 若群組權限查不到，再透過 userId 查使用者在其他群組的權限
            UserGroupRole oUserGroupRoleByLineId = userGroupRoleService.findByLineID(userId);

            if (oUserGroupRoleByLineId != null) {
                String token = jwtService.generateToken(
                        userId,
                        oUserGroupRoleByLineId.getGroupID(),
                        oUserGroupRoleByLineId.getRoleID()
                );
                return url + token;
            }

            // 以上都查不到權限，回覆沒有權限訊息
            return "尚無權限";

        } else if ("權限管理".equals(text)) {
            // 先透過 userId 和 groupId 查詢該使用者在該群組的權限
            UserGroupRole aUserGroupRole = userGroupRoleService.getRoleId(userId, groupId);
            UserGroupRole aGroupRole = userGroupRoleService.getGroupRoleByGroupID(groupId);

            if (aUserGroupRole != null && aGroupRole != null) {
                // 如果找到權限，判斷 RoleID 是否為 1 (Admin)
                if (aGroupRole.getRoleID() != 1) {
                    return "尚無權限或查詢權限尚未開啟";
                }
                // 產生 JWT token 並組成查詢網址回傳
                String token = jwtService.generateAdminToken(userId, groupId, aGroupRole.getRoleID());
                return adminURL + token;
            }

            // 若群組權限查不到，再透過 userId 查使用者在其他群組的權限
            UserGroupRole oUserGroupRoleByLineId = userGroupRoleService.findByLineID(userId);

            if (aUserGroupRole != null && aUserGroupRole.getRoleID() == 1) {
                String token = jwtService.generateAdminToken(
                        userId,
                        oUserGroupRoleByLineId.getGroupID(),
                        oUserGroupRoleByLineId.getRoleID()
                );
                return adminURL + token;
            }

            // 以上都查不到權限，回覆沒有權限訊息
            return "尚無權限";
        }

        // 沒有符合的指令
        return null;
    }


    //將離開群組的用戶刪除權限
    private  void deleteRole(String lineID, String groupId) {
        UserGroupRole userGroupRole = userGroupRoleService.getGroupRoleByGroupID(groupId);
        if (userGroupRole != null) {
            userGroupRoleService.deleteUserGroupRole(lineID, groupId);
        }
    }
}