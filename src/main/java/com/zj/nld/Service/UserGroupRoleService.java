package com.zj.nld.Service;

import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.UserGroupRole;

import java.util.List;

public interface UserGroupRoleService {

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

}