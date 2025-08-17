package com.zj.nld.Service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Service.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class LineServiceImpl implements LineService {


    // JWT服務
    private final JwtService jwtService;

    // 使用者權限服務
    private final UserGroupRoleService userGroupRoleService;

    private final GroupRoleService groupRoleService;

    // ngrok開啟網址：ngrok http --domain=bengal-charming-hyena.ngrok-free.app 8080
    private  final String ngrokURL = "https://bengal-charming-hyena.ngrok-free.app";

    // 表單網址
    private final String url = ngrokURL + "/route/index.html?";


    public LineServiceImpl(JwtService jwtService, UserGroupRoleService userGroupRoleService, GroupRoleService groupRoleService) {
        this.jwtService = jwtService;
        this.userGroupRoleService = userGroupRoleService;
        this.groupRoleService = groupRoleService;
    }

    // LINE 的存取權杖（請換成你自己的）
    private final String TOKEN = "u4k1EFm0EHSK8sUIkZVEOs3vIKEQmzFgW/8/PeCFczfxmTousEuJGLdxQnm94w3odQJS+JqmNQU6orX1yNt8eykNrOB0GNrcpOZ2JO3/GIzjarT3F5KI/sfnnYkFqdfb9Ap0wTBjxXbZjk+7XA+sVAdB04t89/1O/w1cDnyilFU=";


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

                    // 取得回覆 Token
                    String replyToken = event.getString("replyToken");

                    UserGroupRole userGroupRole =  new UserGroupRole();;
                    GroupRole groupRole =  new GroupRole();;


                    switch (eventType)
                    {
                        // 類型為訊息
                        case "message" :
                            //----------------------------message--------------------------------------------------
                            // 取得 message 內容
                            JSONObject message = event.getJSONObject("message");
                            // 取得訊息類型
                            String msgOrPic = message.getString("type");
                            // 取得發送訊息的群組 ID
                            String groupId = event.getJSONObject("source").getString("groupId");
                            System.out.println("傳送訊息群組ID: " + groupId);
                            // 取得發送訊息的用戶 ID
                            String userId = event.getJSONObject("source").getString("userId");
                            System.out.println("傳送訊息用戶Id: " + userId);
                            //------------------------------------------------------------------------------

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

                            groupRole = groupRoleService.findGroupRoleByGroupID(joinGroupId);

                            if (groupRole != null) {
                                // 取得 left 區塊
                                JSONObject joined = event.getJSONObject("joined");
                                // 取得 members 陣列
                                JSONArray joinMembers = joined.getJSONArray("members");

                                // 取出每一個 member
                                for (int j = 0; j < joinMembers.size(); j++) {
                                    JSONObject member = joinMembers.getJSONObject(j);
                                    String joinUserId = member.getString("userId");
                                    System.out.println("加入的使用者 ID: " + joinUserId);


                                    userGroupRole.setExternalID(UUID.randomUUID());
                                    userGroupRole.setLineID(joinUserId);
                                    userGroupRole.setGroupID(joinGroupId);
                                    userGroupRole.setRoleID(groupRole.getRoleID());
                                    userGroupRole.setUserName(joinUserId);
                                    userGroupRoleService.ceateUserGroupRole(userGroupRole);
                                    break;
                                }
                            }else{
                                break;
                            }

                        //機器人加入群組
                        case "join" :
                            System.out.println("新增群組權限");
                            groupRole.setGroupID(event.getJSONObject("source").getString("groupId"));
                            groupRole.setGroupName(event.getJSONObject("source").getString("groupId"));
                            groupRole.setRoleID(0);
                            groupRole.setDescription(null);
                            groupRoleService.createGroupRole(groupRole);
                            break;

                        case "leave" :
                            String leaveGroupId = event.getJSONObject("source").getString("groupId");
                            System.out.println("groupId: " + leaveGroupId);
                            groupRoleService.deleteGroupRoleByGroupID(leaveGroupId);
                            break;

                        default :

                            break;
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


    // 紀錄每個使用者目前的對話狀態，例如是否在等待輸入新群組名稱
    HashMap<String, String> userState = new HashMap<>();

    private String handleUserInput(String userId, String groupId, String text) {
        // 取得使用者目前的狀態，預設是 "default"
        String state = userState.getOrDefault(userId, "default");
        GroupRole groupRole = new GroupRole();
        UserGroupRole userGroupRole = new UserGroupRole();
        boolean updateResult = false;


        switch (state) {
            case "awaiting_new_group_name":
                if (text.equals("取消")){
                    // 狀態清除，結束修改流程
                    userState.remove(userId);
                    return "已取消修改使用者名稱";
                }
                groupRole = groupRoleService.findGroupRoleByGroupID(groupId);


                // 呼叫服務更新群組名稱，傳入群組ID與新名稱
                groupRole.setGroupName(text);

                updateResult = groupRoleService.updateGroupRole(groupRole);


                // 狀態清除，結束修改流程
                userState.remove(userId);

                // 根據更新結果回覆使用者
                if (updateResult) {
                    return "已成功將群組名稱修改為：" + text;
                } else {
                    return "修改失敗，請稍後再試";
                }

            case "awaiting_new_user_name":
                if (text.equals("取消")){
                    // 狀態清除，結束修改流程
                    userState.remove(userId);
                    return "已取消修改使用者名稱";
                }
                userGroupRole = userGroupRoleService.getRoleId(userId, groupId);
                userGroupRole.setUserName(text);
                updateResult = userGroupRoleService.updateUserGroupRole(userGroupRole);
                if (updateResult) {
                    userState.remove(userId);
                    return  "已成功將使用者名稱修改為：" + text;
                }else{
                    userState.remove(userId);
                    return "修改失敗，請稍後再試";
                }
            default:
                //機器人指令------------------------------------------------------------------------------------------
                if ("新生指令".equals(text)) {
                    return "目前支援的指令如下：\n"
                            + "1️⃣ 「修改群組名稱」：輸入指令後，機器人會要求您輸入公司或診所的全名，日後參照表單資料做查詢，只能重新命名一次，若要重新命名，請將機器人退出重新加入即可。待更新後，將由管理人員進行審核。\n"
                            + "2️⃣ 「將我加入權限」：為本群組新增使用者權限，在此之前需先更新群組名稱\n"
                            + "3️⃣ 「修改我的名稱」：使用此命令修改使用者的名稱，請輸入使用者全名\n"
                            + "4️⃣ 「表單查詢」：查詢群組相關表單資料，需具備權限\n";
                //先在群組修改群組名稱，以日後可以從群組查詢有關該診所資料------------------------------------------------------------------------------------------
                } else if ("修改群組名稱".equals(text)) {
                    groupRole = groupRoleService.findGroupRoleByGroupID(groupId);
                    if (groupRole.getGroupID().equals(groupRole.getGroupName())){
                        // 偵測到使用者想要修改群組名稱，切換狀態等待輸入新名稱
                        userState.put(userId, "awaiting_new_group_name");
                        return "請輸入想要修改的群組名稱(名稱請修改為公司全名稱)";
                    }else{
                        return "群組名稱已修改過，需要再次修改請將機器人移出群組並重新加入";
                    }
                //使用者加入權限------------------------------------------------------------------------------------------
                } else if("將我加入權限".equals(text)) {
                    if(groupId == null){
                        return "請至群組內使用該指令";
                    }
                    groupRole = groupRoleService.findGroupRoleByGroupID(groupId);
                    if (groupRole.getRoleID() != 0){
                        userGroupRole.setExternalID(UUID.randomUUID());
                        userGroupRole.setLineID(userId);
                        userGroupRole.setUserName(userId);
                        userGroupRole.setGroupID(groupId);
                        userGroupRole.setRoleID(groupRole.getRoleID());
                        userGroupRoleService.ceateUserGroupRole(userGroupRole);
                        return "使用者權限新增完成";
                    }else if (groupRole != null){
                        return "已加入權限，若還是無法查詢表單，請檢查使用者名稱即群組名稱有無確實更改";
                    }else{
                        return "群組權限可能尚未開通，或群組名稱尚未更新，請稍後再試一次";
                    }
                //修改使用者名稱才可以在私訊機器人後得到群組資料------------------------------------------------------------------------------------------
                }else if ("修改我的名稱".equals(text)) {
                    userGroupRole = userGroupRoleService.findByLineID(userId);
                    groupRole = groupRoleService.findGroupRoleByGroupID(groupId);
                    if (userGroupRole.getGroupID().equals(groupRole.getGroupID()) && groupRole.getRoleID() != 0 && userGroupRole.getLineID().equals(userGroupRole.getUserName())) {
                        userState.put(userId, "awaiting_new_user_name");
                        return "請輸入想要修改的使用者名稱(名稱請修改為使用者全名)";
                    }else if (!userGroupRole.getLineID().equals(userGroupRole.getUserName())) {
                        return "已修改過，請重新加入群組來修改名稱";
                    }else{
                        return "群組權限可能尚未開通，或群族名稱尚未更新，因此無法進行使用者名稱的修改";
                    }

                //修改群組名稱才可以加入使用者權限------------------------------------------------------------------------------------------
                }else if ("表單查詢".equals(text)) {
                    // 使用者想要查詢表單，開始權限判斷流程

                    // 先透過 userId 和 groupId 查詢該使用者在該群組的權限
                    userGroupRole = userGroupRoleService.getRoleId(userId, groupId);
                    groupRole = groupRoleService.findGroupRoleByGroupID(groupId);


                    if (userGroupRole != null && groupRole != null) {
                        // 如果找到權限，判斷 RoleID 是否為 0 (無權限)
                        if (groupRole.getRoleID() == 0 ) {
                            return "尚無權限或查詢權限尚未開啟";
                        }
                        // 產生 JWT token 並組成查詢網址回傳
                        String token = jwtService.generateToken(userId, groupId, userGroupRole.getRoleID());
                        return url + token;
                    }

                    // 若群組權限查不到，再透過 userId 查使用者在其他群組的權限
                    UserGroupRole userGroupRoleByLineId = userGroupRoleService.findByLineID(userId);

                    if (userGroupRoleByLineId != null) {
                        String token = jwtService.generateToken(
                                userId,
                                userGroupRoleByLineId.getGroupID(),
                                userGroupRoleByLineId.getRoleID()
                        );
                        return url + token;
                    }

                    // 以上都查不到權限，回覆沒有權限訊息
                    return "尚無權限";
                }else{
                    // 使用者輸入的不是支援的指令，這裡目前設計不回覆訊息
                    // 若要回覆提示，可改成 return "請輸入『表單查詢』或『修改群組名稱』";
                    return null;
                }
        }
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


    //將離開群組的用戶刪除權限
    private  void deleteRole(String lineID, String groupId) {
        GroupRole groupRole = groupRoleService.findGroupRoleByGroupID(groupId);
        if (groupRole != null) {
            userGroupRoleService.deleteUserGroupRole(lineID, groupId);
        }
    }
}


// 未來多個指令可使用
//Map<String, Function<UserContext, String>> commandHandlers = new HashMap<>();
//
//commandHandlers.put("表單查詢", this::handleFormQuery);
//commandHandlers.put("修改群組名稱", this::handleRenameGroup);
//// ...
//
//String response = commandHandlers.getOrDefault(text, this::handleUnknown).apply(context);
