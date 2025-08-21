package com.zj.nld.Service;

import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;

import java.util.List;

public interface GroupRoleService {

    // 搜尋群組
    GroupRole findGroupRoleByGroupID(String groupID);

    // 建立群組
    GroupRole createGroupRole(GroupRole groupRole);

    // 更新群組名稱
    boolean updateGroupRole(GroupRole groupRole);

    // 刪除群組
    void deleteGroupRoleByGroupID(String groupID);

    // 在GroupRole根據groupID取得對應的權限ID
    GroupRole getGroupRoleByGroupID(String groupID);


    List<GroupRole> getAdminByToken(String token);

    // 批量更新群組權限
    List<GroupRole> updateGroupRoles(List<GroupRoleRequest> groupRolesDTO);
}
