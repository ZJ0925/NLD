package com.zj.nld.Service;

import com.zj.nld.Model.Entity.UserGroupRole;

public interface UserGroupRoleService {

    //建立使用者權限
    UserGroupRole ceateUserGroupRole(UserGroupRole userGroupRole);

    //刪除使用者權限
    void deleteUserGroupRole(String lineID, String groupID);

    // 在UserGroupRole根據lineID與groupID取得對應的權限ID
    UserGroupRole getRoleId(String lineId, String groupId);

    // 在UserGroupRole根據lineID與groupID取得對應的權限ID
    UserGroupRole findByLineID(String lineId);

    // 更新使用者名稱
    boolean updateUserGroupRole(UserGroupRole userGroupRole);
}
