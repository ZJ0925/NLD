package com.zj.nld.Service;

import com.zj.nld.Model.GroupRole;
import com.zj.nld.Model.UserGroupRole;

public interface PermissionService {

    // 根據lineID與groupID取得對應的UserGroupRole
    UserGroupRole getRoleId(String lineId, String groupId);

    // 根據lineID與groupID取得對應的GroupRole
    GroupRole getGroupRoleByGroupID(String groupID);

    //根據LINE ID找到權限資料
    UserGroupRole findByLineID(String lineID);

}
