package com.zj.nld.Service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Service.*;
import com.zj.nld.util.LineUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class LineServiceImpl implements LineService {

    // NLD跳轉網址
    private String indexURL;

    //超級管理員網址
    private String adminURL;

    // 群組權限網址
    private String groupRoleURL;

    @Value("${IndexURL}")
    public void setIndexURL(String indexURL) {
        this.indexURL = indexURL;
    }

    @Value("${AdminURL}")
    public void setAdminURL(String adminURL) {
        this.adminURL = adminURL;
    }

    @Value("${GroupRoleURL}")
    public void setGroupRoleURL(String groupRoleURL) {
        this.groupRoleURL = groupRoleURL;
    }

    // 使用者權限服務
    private final UserGroupRoleService userGroupRoleService;

    // ========== ✅ 群組名稱快取 ==========
    private final Map<String, CachedGroupName> groupNameCache = new ConcurrentHashMap<>();

    /**
     * 快取資料結構
     */
    private static class CachedGroupName {
        String groupName;
        LocalDateTime lastUpdate;

        CachedGroupName(String groupName, LocalDateTime lastUpdate) {
            this.groupName = groupName;
            this.lastUpdate = lastUpdate;
        }
    }

    // 建構子
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

                    // 事件類型（message、join、leave、memberJoined 等）
                    String eventType = event.getString("type");

                    // 事件來源（個人 / 群組 / 多人聊天室）
                    JSONObject source = event.getJSONObject("source");

                    // 來源類型：會是 "user"、"group" 或 "room"
                    String sourceType = source.getString("type");

                    // 如果是群組才會有 groupId，如果是個人聊天則沒有
                    String groupId = source.containsKey("groupId") ? source.getString("groupId") : null;

                    // 如果是群組或個人聊天都可能有 userId（但 join/leave 事件會沒有）
                    String userId = source.containsKey("userId") ? source.getString("userId") : null;

                    // 取得回覆 Token
                    String replyToken = event.getString("replyToken");

                    switch (eventType) {
                        // 類型為訊息
                        case "message":
                            System.out.println("eventType: message");
                            if ("group".equals(sourceType)) {
                                JSONObject member = LineUtil.getGroupMemberProfile(groupId, userId);
                                if (member != null) {
                                    System.out.println("message 使用者ID: " + member.getString("userId"));
                                    System.out.println("message顯示名稱: " + member.getString("displayName"));
                                    System.out.println("message 頭像URL: " + member.getString("pictureUrl"));
                                } else {
                                    System.out.println("❌ 無法取得成員資料，可能權限不足或token無效。");
                                }
                                System.out.println("此事件來自群組: " + groupId);
                                if (userId != null) {
                                    System.out.println("發話者 userId: " + userId);
                                } else {
                                    System.out.println("⚠️ 無 userId，可能是 join/leave 事件");
                                }
                            } else if ("user".equals(sourceType)) {
                                System.out.println("此事件來自個人聊天室，userId: " + userId);
                            }

                            //----------------------------message--------------------------------------------------
                            // 取得 message 內容
                            JSONObject message = event.getJSONObject("message");
                            // 取得訊息類型
                            String msgOrPic = message.getString("type");

                            // 處理不同類型的訊息
                            if ("image".equals(msgOrPic)) {
                                // 如果收到圖片訊息，可以在這裡添加處理邏輯

                            } else if ("text".equals(msgOrPic)) {
                                String messageText = event.getJSONObject("message").getString("text");
                                String response = handleUserInput(userId, groupId, messageText);
                                LineUtil.sendReply(replyToken, response);
                            } else {
                                // 其他訊息類型
                            }
                            break;

                        case "memberLeft":
                            System.out.println("eventType: memberLeft");
                            String leftGroupId = event.getJSONObject("source").getString("groupId");

                            // 取得 left 區塊
                            JSONObject left = event.getJSONObject("left");
                            // 取得 members 陣列
                            JSONArray members = left.getJSONArray("members");

                            // 取出每一個 member
                            for (int j = 0; j < members.size(); j++) {
                                JSONObject leftMember = members.getJSONObject(j);
                                String leftUserId = leftMember.getString("userId");
                                deleteRole(leftUserId, leftGroupId);
                            }
                            break;

                        case "memberJoined":
                            System.out.println("eventType: memberJoined");
                            // 取得加入事件的群組 ID
                            String joinGroupId = event.getJSONObject("source").getString("groupId");

                            // 取得 joined 區塊
                            JSONObject joined = event.getJSONObject("joined");
                            // 取得 members 陣列
                            JSONArray joinMembers = joined.getJSONArray("members");

                            JSONObject groupInfo = LineUtil.getGroupSummary(joinGroupId);

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
                                String displayName = userProfile.getString("displayName");

                                // 創建新的 UserGroupRole 物件
                                UserGroupRole mjUserGroupRole = new UserGroupRole();
                                mjUserGroupRole.setExternalID(UUID.randomUUID());
                                mjUserGroupRole.setLineID(joinUserId);
                                mjUserGroupRole.setUserName(userProfile.getString("displayName"));
                                mjUserGroupRole.setLineNiceName(displayName);  // ✅ 記錄原始 LINE 暱稱
                                mjUserGroupRole.setGroupID(joinGroupId);
                                mjUserGroupRole.setGroupName(referenceGroupName);
                                mjUserGroupRole.setGroupNameID(referenceGroupNameID);
                                mjUserGroupRole.setRoleID(2);

                                try {
                                    userGroupRoleService.ceateUserGroupRole(mjUserGroupRole);
                                } catch (Exception e) {
                                    System.err.println("為使用者 " + joinUserId + " 建立權限失敗: " + e.getMessage());
                                }
                            }
                            break;

                        //機器人加入群組
                        case "join":
                            System.out.println("eventType: join");
                            List<String> userIdList = LineUtil.getGroupUserID(groupId);
                            JSONObject groupProfile = LineUtil.getGroupSummary(groupId);
                            for (int j = 0; j < userIdList.size(); j++) {
                                // 空物件
                                UserGroupRole joinUserGroupRole = new UserGroupRole();
                                //取得使用者資訊
                                JSONObject joinUserProfile = LineUtil.getGroupMemberProfile(groupId, userIdList.get(j));
                                String displayName = joinUserProfile.getString("displayName");

                                joinUserGroupRole.setExternalID(UUID.randomUUID());
                                joinUserGroupRole.setLineID(userIdList.get(j));
                                joinUserGroupRole.setUserName(joinUserProfile.getString("displayName"));
                                joinUserGroupRole.setLineNiceName(displayName);  // ✅ 記錄原始 LINE 暱稱
                                joinUserGroupRole.setGroupID(groupId);
                                joinUserGroupRole.setGroupName(groupProfile.getString("groupName"));
                                joinUserGroupRole.setRoleID(2);

                                try {
                                    userGroupRoleService.ceateUserGroupRole(joinUserGroupRole);
                                } catch (Exception e) {
                                    System.err.println("為使用者 " + userIdList.get(j) + " 建立權限失敗: " + e.getMessage());
                                }
                            }
                            break;

                        case "leave":
                            String leaveGroupId = event.getJSONObject("source").getString("groupId");
                            userGroupRoleService.deleteGroupRoleByGroupID(leaveGroupId);
                            break;

                        default:
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


    private String handleUserInput(String userId, String groupId, String text) {

        switch (text.trim()) {
            case "表單查詢":
                // 先透過 userId 和 groupId 查詢該使用者在該群組的權限
                UserGroupRole fUserGroupRole = userGroupRoleService.getRoleId(userId, groupId);

                if (fUserGroupRole != null) {
                    return indexURL + groupId;
                }

                // 若群組權限查不到，再透過 userId 查使用者在其他群組的權限
                UserGroupRole oUserGroupRoleByLineId = userGroupRoleService.findByLineID(userId);

                // 以上都查不到權限，回覆沒有權限訊息
                return "尚無權限";

            case "我的資訊":
                return "LineID為" + userId;

            case "超級管理員":
                return adminURL;

            case "權限管理":
                return groupRoleURL;

            default:
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


    // ========== ✅ 群組名稱同步功能 ==========

    /**
     * 從 LINE API 取得群組名稱
     *
     * @param groupId 群組 ID
     * @return 群組名稱，失敗則返回 null
     */
    @Override
    public String getGroupName(String groupId) {
        try {
            JSONObject groupInfo = LineUtil.getGroupSummary(groupId);
            if (groupInfo != null && groupInfo.containsKey("groupName")) {
                return groupInfo.getString("groupName");
            }
        } catch (Exception e) {
            System.err.println("取得群組名稱失敗: " + groupId + " - " + e.getMessage());
        }
        return null;
    }

    /**
     * 取得群組名稱（帶快取機制）
     *
     * @param groupId    群組 ID
     * @param cacheHours 快取有效時數（0 表示不使用快取）
     * @return 群組名稱
     */
    private String getGroupNameWithCache(String groupId, int cacheHours) {
        CachedGroupName cached = groupNameCache.get(groupId);

        // 檢查快取是否有效
        if (cached != null && cacheHours > 0) {
            LocalDateTime expiryTime = cached.lastUpdate.plusHours(cacheHours);
            if (LocalDateTime.now().isBefore(expiryTime)) {
                System.out.println("   📦 使用快取: " + groupId + " - " + cached.groupName);
                return cached.groupName;
            }
        }

        // 從 LINE API 取得
        String groupName = getGroupName(groupId);
        if (groupName != null && !groupName.isEmpty()) {
            groupNameCache.put(groupId, new CachedGroupName(groupName, LocalDateTime.now()));
            return groupName;
        }

        // 如果 API 失敗，從資料庫取得
        String dbGroupName = userGroupRoleService.getGroupNameFromDB(groupId);
        if (dbGroupName != null) {
            System.out.println("   ⚠️ API 失敗，使用資料庫資料: " + dbGroupName);
        }
        return dbGroupName;
    }

    /**
     * 同步單一群組名稱
     *
     * @param groupId 群組 ID
     * @return 是否成功
     */
    @Override
    public boolean syncGroupName(String groupId) {
        try {
            String groupName = getGroupName(groupId);

            if (groupName != null && !groupName.isEmpty()) {
                boolean updated = userGroupRoleService.updateGroupName(groupId, groupName);

                if (updated) {
                    groupNameCache.put(groupId, new CachedGroupName(groupName, LocalDateTime.now()));
                    System.out.println("✅ 群組名稱同步成功: " + groupId + " - " + groupName);
                    return true;
                }
            }
        } catch (Exception e) {
            System.err.println("❌ 同步群組名稱失敗: " + groupId + " - " + e.getMessage());
        }
        return false;
    }

    /**
     * 批量同步所有群組名稱（加入速率控制）
     *
     * @return 同步結果統計
     */
    @Override
    public Map<String, Object> syncAllGroupNames() {
        List<String> allGroupIds = userGroupRoleService.getAllGroupIds();
        int totalGroups = allGroupIds.size();
        int successCount = 0;
        int failCount = 0;
        List<Map<String, String>> results = new ArrayList<>();

        System.out.println("🔄 開始批量同步 " + totalGroups + " 個群組...");

        for (int i = 0; i < allGroupIds.size(); i++) {
            String groupId = allGroupIds.get(i);

            try {
                System.out.println("   同步進度: (" + (i + 1) + "/" + totalGroups + ") - " + groupId);

                // 使用快取機制，24 小時內不重複查詢
                String groupName = getGroupNameWithCache(groupId, 24);

                if (groupName != null && !groupName.isEmpty()) {
                    // 更新資料庫
                    boolean updated = userGroupRoleService.updateGroupName(groupId, groupName);

                    if (updated) {
                        successCount++;
                        results.add(Map.of(
                                "groupId", groupId,
                                "groupName", groupName,
                                "status", "success"
                        ));
                        System.out.println("   ✅ 同步成功: " + groupName);
                    } else {
                        failCount++;
                        results.add(Map.of(
                                "groupId", groupId,
                                "status", "failed",
                                "reason", "資料庫更新失敗"
                        ));
                    }
                } else {
                    failCount++;
                    results.add(Map.of(
                            "groupId", groupId,
                            "status", "failed",
                            "reason", "無法取得群組名稱"
                    ));
                }

                // ✅ 速率控制：每次請求延遲 100ms（避免超過 LINE API 限制）
                if (i < allGroupIds.size() - 1) {
                    Thread.sleep(100);
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("❌ 同步被中斷");
                break;
            } catch (Exception e) {
                failCount++;
                results.add(Map.of(
                        "groupId", groupId,
                        "status", "error",
                        "reason", e.getMessage()
                ));
                System.err.println("   ❌ 同步錯誤: " + e.getMessage());
            }
        }

        System.out.println("🎉 同步完成: 成功 " + successCount + " / 失敗 " + failCount);

        // 返回結果
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("totalGroups", totalGroups);
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("message", "群組名稱同步完成");
        result.put("results", results);

        return result;
    }

    /**
     * 同步群組成員資料
     *
     * @param groupId 群組 ID
     * @return 同步結果統計
     */
    @Override
    public Map<String, Object> syncGroupMembers(String groupId) {
        Map<String, Object> result = new HashMap<>();

        try {
            System.out.println("========================================");
            System.out.println("📥 開始同步群組成員");
            System.out.println("群組 ID: " + groupId);
            System.out.println("執行時間: " + LocalDateTime.now());
            System.out.println("========================================");

            // 1️⃣ 從 LINE API 取得群組成員列表
            List<String> memberIds = LineUtil.getGroupUserID(groupId);

            if (memberIds == null || memberIds.isEmpty()) {
                result.put("success", false);
                result.put("message", "無法取得群組成員列表（可能是權限不足或群組不存在）");
                System.err.println("❌ 無法取得群組成員列表");
                return result;
            }

            System.out.println("📋 LINE 群組中共有 " + memberIds.size() + " 個成員");

            // 2️⃣ 取得現有的群組成員記錄
            List<UserGroupRole> existingMembers = userGroupRoleService.findByGroupID(groupId);
            Set<String> existingLineIds = existingMembers.stream()
                    .map(UserGroupRole::getLineID)
                    .collect(Collectors.toSet());

            System.out.println("📋 資料庫中現有 " + existingMembers.size() + " 筆記錄");

            // 3️⃣ 取得群組名稱和 GroupNameID（從既有成員中取得）
            String groupName = null;
            String groupNameID = null;

            // 從既有成員中找第一個有完整資料的成員作為參考
            Optional<UserGroupRole> referenceRole = existingMembers.stream()
                    .filter(r -> r.getGroupName() != null && r.getGroupNameID() != null)
                    .findFirst();

            if (referenceRole.isPresent()) {
                groupName = referenceRole.get().getGroupName();
                groupNameID = referenceRole.get().getGroupNameID();
                System.out.println("✅ 從既有成員取得群組資訊:");
                System.out.println("   群組名稱: " + groupName);
                System.out.println("   GroupNameID: " + groupNameID);
            } else {
                // 如果沒有既有成員，從 LINE API 取得群組名稱
                JSONObject groupInfo = LineUtil.getGroupSummary(groupId);
                if (groupInfo != null) {
                    groupName = groupInfo.getString("groupName");
                    groupNameID = UUID.randomUUID().toString();
                    System.out.println("✅ 從 LINE API 取得群組名稱: " + groupName);
                    System.out.println("✅ 生成新的 GroupNameID: " + groupNameID);
                } else {
                    groupName = "未知群組";
                    groupNameID = UUID.randomUUID().toString();
                    System.out.println("⚠️ 無法取得群組名稱，使用預設值");
                }
            }

            // 4️⃣ 處理新成員（在 LINE 群組中但不在資料庫中）
            int addedCount = 0;
            int updatedCount = 0;
            List<String> addedMembers = new ArrayList<>();

            for (String lineId : memberIds) {
                if (!existingLineIds.contains(lineId)) {
                    // 新成員：取得用戶資料並加入資料庫
                    JSONObject profile = LineUtil.getGroupMemberProfile(groupId, lineId);

                    if (profile != null) {
                        String displayName = profile.getString("displayName");

                        UserGroupRole newMember = new UserGroupRole();
                        newMember.setExternalID(UUID.randomUUID());
                        newMember.setLineID(lineId);
                        newMember.setUserName(displayName);
                        newMember.setLineNiceName(displayName);
                        newMember.setUserNameID(null);
                        newMember.setGroupID(groupId);
                        newMember.setGroupName(groupName);
                        newMember.setGroupNameID(groupNameID);
                        newMember.setRoleID(0);  // 預設為失效人員

                        try {
                            userGroupRoleService.ceateUserGroupRole(newMember);
                            addedCount++;
                            addedMembers.add(displayName);
                            System.out.println("   ➕ 新增成員: " + displayName);
                        } catch (Exception e) {
                            System.err.println("   ❌ 新增成員失敗: " + displayName + " - " + e.getMessage());
                        }
                    } else {
                        System.err.println("   ⚠️ 無法取得成員資料: " + lineId);
                    }

                } else {
// 現有成員：檢查是否需要重新啟用
                    UserGroupRole existingMember = existingMembers.stream()
                            .filter(m -> m.getLineID().equals(lineId))
                            .findFirst()
                            .orElse(null);

                    if (existingMember != null && existingMember.getRoleID() == 0) {
                        // ✅ 重新啟用時，也要確保 lineNiceName 存在
                        if (existingMember.getLineNiceName() == null || existingMember.getLineNiceName().isEmpty()) {
                            // 如果舊資料沒有 lineNiceName，補上
                            JSONObject profile = LineUtil.getGroupMemberProfile(groupId, lineId);
                            if (profile != null) {
                                existingMember.setLineNiceName(profile.getString("displayName"));
                            }
                        }

                        // 將失效人員重新啟用為牙助
                        existingMember.setRoleID(5);
                        userGroupRoleService.updateUserGroupRole(existingMember);
                        updatedCount++;
                        System.out.println("   ♻️ 重新啟用成員: " + existingMember.getUserName());
                    } else if (existingMember != null) {
                        // ✅ 對於既有的正常成員，檢查是否需要補上 lineNiceName（向下相容舊資料）
                        if (existingMember.getLineNiceName() == null || existingMember.getLineNiceName().isEmpty()) {
                            JSONObject profile = LineUtil.getGroupMemberProfile(groupId, lineId);
                            if (profile != null) {
                                existingMember.setLineNiceName(profile.getString("displayName"));
                                userGroupRoleService.updateUserGroupRole(existingMember);
                                System.out.println("   📝 補充 lineNiceName: " + existingMember.getUserName());
                            }
                        }
                    }
                }
            }

            // 5️⃣ 處理已退出的成員（在資料庫中但不在 LINE 群組中）
            int deactivatedCount = 0;
            Set<String> currentMemberIds = new HashSet<>(memberIds);
            List<String> deactivatedMembers = new ArrayList<>();

            for (UserGroupRole member : existingMembers) {
                if (!currentMemberIds.contains(member.getLineID()) && member.getRoleID() != 0) {
                    // 將已退出的成員標記為失效人員
                    member.setRoleID(0);
                    member.setUserNameID(null);
                    userGroupRoleService.updateUserGroupRole(member);
                    deactivatedCount++;
                    deactivatedMembers.add(member.getUserName());
                    System.out.println("   ⛔ 停用成員: " + member.getUserName());
                }
            }

            // 6️⃣ 輸出統計結果
            System.out.println("========================================");
            System.out.println("✅ 同步完成");
            System.out.println("總成員數: " + memberIds.size());
            System.out.println("新增成員: " + addedCount);
            System.out.println("重新啟用: " + updatedCount);
            System.out.println("停用成員: " + deactivatedCount);
            System.out.println("========================================");

            // 7️⃣ 返回結果
            result.put("success", true);
            result.put("groupID", groupId);
            result.put("groupName", groupName);
            result.put("totalMembers", memberIds.size());
            result.put("addedMembers", addedCount);
            result.put("updatedMembers", updatedCount);
            result.put("deactivatedMembers", deactivatedCount);
            result.put("addedMemberNames", addedMembers);
            result.put("deactivatedMemberNames", deactivatedMembers);
            result.put("message", "同步完成");

            return result;

        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("❌ 同步群組成員失敗: " + e.getMessage());
            System.err.println("========================================");
            e.printStackTrace();

            result.put("success", false);
            result.put("message", "同步失敗: " + e.getMessage());
            return result;
        }
    }


    // ========== ✅ 排程任務 ==========

    /**
     * 定時同步所有群組名稱
     * 每天凌晨 3 點自動執行
     * Cron 表達式說明：秒 分 時 日 月 星期
     */
    @Scheduled(cron = "0 0 3 * * ?")  // 每天凌晨 3:00
    public void scheduledSyncGroupNames() {
        System.out.println("========================================");
        System.out.println("⏰ 開始定時同步群組名稱");
        System.out.println("執行時間: " + LocalDateTime.now());
        System.out.println("========================================");

        try {
            // 清除所有快取，強制重新查詢
            groupNameCache.clear();
            System.out.println("🗑️ 已清除所有快取，將重新查詢");

            // 執行批量同步
            Map<String, Object> result = syncAllGroupNames();

            // 輸出結果統計
            System.out.println("========================================");
            System.out.println("✅ 定時同步完成");
            System.out.println("總群組數: " + result.get("totalGroups"));
            System.out.println("成功數量: " + result.get("successCount"));
            System.out.println("失敗數量: " + result.get("failCount"));
            System.out.println("========================================");

        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("❌ 定時同步發生錯誤: " + e.getMessage());
            System.err.println("========================================");
            e.printStackTrace();
        }
    }

    /**
     * 測試用排程：每小時執行一次（可選）
     * 如果想要更頻繁的同步，可以啟用這個方法
     */
    // @Scheduled(cron = "0 0 * * * ?")  // 每小時執行一次
    public void hourlySync() {
        System.out.println("⏰ 每小時同步群組名稱 - " + LocalDateTime.now());

        try {
            Map<String, Object> result = syncAllGroupNames();
            System.out.println("✅ 每小時同步完成 - 成功: " + result.get("successCount"));
        } catch (Exception e) {
            System.err.println("❌ 每小時同步失敗: " + e.getMessage());
        }
    }

}