package com.zj.nld.Service;

import com.zj.nld.Model.UserGroupRole;

public interface PermissionService {

    // 根據lineID與groupID取得對應的權限ID
    UserGroupRole getRoleId(String lineId, String groupId);



}
