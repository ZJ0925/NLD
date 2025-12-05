package com.zj.nld.Service;

import com.zj.nld.Model.Entity.UserGroupRole;

import java.util.List;

public interface UserGroupRoleService {

    /**
     * 取得所有不重複的群組 ID
     * @return 群組 ID 清單
     */
    List<String> getAllGroupIds();

    /**
     * 更新指定群組的名稱
     * @param groupId 群組 ID
     * @param newGroupName 新的群組名稱
     * @return 是否更新成功
     */
    boolean updateGroupName(String groupId, String newGroupName);

    /**
     * 從資料庫取得群組名稱
     * @param groupId 群組 ID
     * @return 群組名稱，查無則返回 null
     */
    String getGroupNameFromDB(String groupId);

    // 查詢同一群組的所有成員
    List<UserGroupRole> findByGroupID(String groupID);

    //建立使用者權限
    UserGroupRole ceateUserGroupRole(UserGroupRole userGroupRole);

    //刪除使用者權限
    void deleteUserGroupRole(String lineID, String groupID);

    // 在UserGroupRole根據lineID與groupID取得對應的權限ID
    UserGroupRole getRoleId(String lineId, String groupId);

    // 在UserGroupRole根據lineID取得權限資料
    UserGroupRole findByLineID(String lineId);

    // 刪除群組的所有權限
    void deleteGroupRoleByGroupID(String groupID);


    // 根據Token取得管理員權限資料
    List<UserGroupRole> getAllRole();


    /**
     * 驗證使用者是否為群組權限管理者
     * 透過 Authorization Header 中的 Access Token 驗證
     */
    boolean findRoleManagerByauthHeader(String authHeader);

    boolean updateUserGroupRole(UserGroupRole userGroupRole);

}