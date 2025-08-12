package com.zj.nld.Service;

import com.zj.nld.Model.Entity.UserGroupRole;

public interface UserGroupRoleService {

    //建立使用者權限
    UserGroupRole ceateUserGroupRole(UserGroupRole userGroupRole);

    //刪除使用者權限
    void deleteUserGroupRole(String lineID, String groupID);
}
