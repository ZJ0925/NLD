package com.zj.nld.Service;

import com.zj.nld.Model.Entity.UserGroupRole;

import java.util.List;

public interface UserGroupRoleService {

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

}