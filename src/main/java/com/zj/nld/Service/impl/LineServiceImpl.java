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
    private String url;

    @Value("${URL}")
    public void setUrl(String url) {
        this.url = url;
    }



    // 使用者權限服務
    private final UserGroupRoleService userGroupRoleService;


    public LineServiceImpl(UserGroupRoleService userGroupRoleService) {
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
//                    System.out.println("動作類型: " + eventType);

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
//                                System.out.println("發出訊息: " + messageText);
                                String response = handleUserInput(userId, groupId, messageText);
                                LineUtil.sendReply(replyToken, response);
                            } else {
//                                System.out.println("不合法傳入, 請傳 image 及 text");
                            }
                            break;

                        case "memberLeft" :
                            String leftGroupId = event.getJSONObject("source").getString("groupId");
//                            System.out.println("離開群組ID: " + leftGroupId);

                            // 取得 left 區塊
                            JSONObject left = event.getJSONObject("left");
                            // 取得 members 陣列
                            JSONArray members = left.getJSONArray("members");

                            // 取出每一個 member
                            for (int j = 0; j < members.size(); j++) {
                                JSONObject leftMember = members.getJSONObject(j);
                                String leftUserId = leftMember.getString("userId");
//                                System.out.println("離開的使用者 ID: " + leftUserId);
                                deleteRole(leftUserId, leftGroupId);
                            }
                            break;

                        case "memberJoined":
                            // 取得加入事件的群組 ID
                            String joinGroupId = event.getJSONObject("source").getString("groupId");
//                            System.out.println("加入群組ID: " + joinGroupId);

                            // 取得 joined 區塊
                            JSONObject joined = event.getJSONObject("joined");
                            // 取得 members 陣列
                            JSONArray joinMembers = joined.getJSONArray("members");

                            JSONObject groupInfo =  LineUtil.getGroupSummary(joinGroupId);

                            // 查找同一群組的既有成員
                            List<UserGroupRole> existingRoles = userGroupRoleService.findByGroupID(joinGroupId);

                            // 從既有成員中找第一個 GroupNameID 與 GroupName 都不為 null 的成員作為參考
                            Optional<UserGroupRole> referenceRole = existingRoles.stream()
                                    .filter(r -> r.getGroupNameID() != null && r.getGroupName() != null)
                                    .findFirst();

                            // 取得參考資料，如果沒有既有成員則生成新的 GroupNameID
                            String referenceGroupNameID = referenceRole
                                    .map(UserGroupRole::getGroupNameID)
                                    .orElse(UUID.randomUUID().toString());

                            assert groupInfo != null;
                            String referenceGroupName = referenceRole
                                    .map(UserGroupRole::getGroupName)
                                    .orElse(groupInfo.getString("groupName"));

                            // 處理每一個新加入成員
                            for (int j = 0; j < joinMembers.size(); j++) {
                                JSONObject member = joinMembers.getJSONObject(j);
                                String joinUserId = member.getString("userId");

                                // 取得新成員個人資訊
                                JSONObject userProfile = LineUtil.getGroupMemberProfile(joinGroupId, joinUserId);

                                // 創建新的 UserGroupRole 物件
                                UserGroupRole mjUserGroupRole = new UserGroupRole();
                                mjUserGroupRole.setExternalID(UUID.randomUUID());         // 唯一 ID
                                mjUserGroupRole.setLineID(joinUserId);                    // Line ID
                                mjUserGroupRole.setUserName(userProfile.getString("displayName")); // 使用者名稱
                                mjUserGroupRole.setGroupID(joinGroupId);                  // 群組 ID
                                mjUserGroupRole.setGroupName(referenceGroupName);         // 套用參考群組名稱
                                mjUserGroupRole.setGroupNameID(referenceGroupNameID);     // 套用參考群組名稱 ID
                                mjUserGroupRole.setRoleID(2);                             // 預設角色 ID

                                try {
                                    userGroupRoleService.ceateUserGroupRole(mjUserGroupRole); // 儲存到資料庫
//                                    System.out.println("成功為使用者 " + joinUserId + " 建立權限");
                                } catch (Exception e) {
//                                    System.err.println("為使用者 " + joinUserId + " 建立權限失敗: " + e.getMessage());
                                }
                            }
                            break;

                        //機器人加入群組(先不實作)
                        case "join" :
                            List<String> userIdList =  LineUtil.getGroupUserID(groupId);
                            JSONObject groupProfile = LineUtil.getGroupSummary(groupId);
                            for (int j = 0; j < userIdList.size(); j++) {
                                // 空物件
                                UserGroupRole joinUserGroupRole = new UserGroupRole();
                                //取得使用者資訊
                                JSONObject joinUserProfile = LineUtil.getGroupMemberProfile(groupId, userIdList.get(j));


                                joinUserGroupRole.setExternalID(UUID.randomUUID());
                                joinUserGroupRole.setLineID(userIdList.get(j));
                                joinUserGroupRole.setUserName(joinUserProfile.getString("displayName"));
                                joinUserGroupRole.setGroupID(groupId);
                                joinUserGroupRole.setGroupName(groupProfile.getString("groupName"));
                                joinUserGroupRole.setRoleID(2);

                                try {
                                    userGroupRoleService.ceateUserGroupRole(joinUserGroupRole);
//                                    System.out.println("成功為使用者 " + userIdList.get(j) + " 建立權限");
                                } catch (Exception e) {
//                                    System.err.println("為使用者 " + userIdList.get(j) + " 建立權限失敗: " + e.getMessage());
                                }


                            }


//                            System.out.println("加入到新的群組");
                            break;

                        case "leave" :
                            String leaveGroupId = event.getJSONObject("source").getString("groupId");
//                            System.out.println("groupId: " + leaveGroupId);
                            userGroupRoleService.deleteGroupRoleByGroupID(leaveGroupId);
                            break;

                        default :
                            break;
                    }
                }
            } else {
//                System.out.println("event null......不合法的傳入");
            }

        } catch (Exception e) {
            System.err.println("⚠ 解析 LINE Webhook 失敗： " + e.getMessage());
        }
        return "OK";
    }


    private String handleUserInput(String userId, String groupId, String text) {

        switch (text){
            case"表單查詢":
                // 先透過 userId 和 groupId 查詢該使用者在該群組的權限
                UserGroupRole fUserGroupRole = userGroupRoleService.getRoleId(userId, groupId);

                if (fUserGroupRole != null) {
                    return url + groupId;
                }

                // 若群組權限查不到，再透過 userId 查使用者在其他群組的權限
                UserGroupRole oUserGroupRoleByLineId = userGroupRoleService.findByLineID(userId);//

                // 以上都查不到權限，回覆沒有權限訊息
                return "尚無權限";

            case "我的資訊":
                return "LineID為" + userId;

            default :
                return null;
        }
    }


    //將離開群組的用戶刪除權限
    private void deleteRole(String lineID, String groupID) {
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineID, groupID);
        if (userGroupRole != null) {
            userGroupRoleService.deleteUserGroupRole(lineID, groupID);
        }
    }
}