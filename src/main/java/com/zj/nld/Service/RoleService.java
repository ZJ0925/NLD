package com.zj.nld.Service;


import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;

import java.util.List;

public interface RoleService {

    // 取得所有群組權限
    public List<GroupRoleRequest> getAllGroupRole();

    // 取得單筆群組權限
    GroupRoleRequest getGroupRoleByGroupID(String groupID);

    // 新增權限
    GroupRoleRequest createGroupRole(GroupRoleRequest groupRoleRequest);

    // 更新權限
    GroupRoleRequest updateGroupRole(String groupID, GroupRoleRequest groupRoleRequest);

    // 刪除群組權限
    void deleteGroupRole(String groupID);

}
