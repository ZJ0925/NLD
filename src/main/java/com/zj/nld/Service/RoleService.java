package com.zj.nld.Service;


import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;

import java.util.List;
import java.util.UUID;

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


    //------------------------------------------------------------------------------------------------

    // 取得所有User權限
    List<UserGroupRoleRequest> getAllUserGroupRole();

    // 取得單筆User權限
    UserGroupRoleRequest getUserGroupRoleByExternalID(UUID externalID);

    // 新增User權限
    UserGroupRoleRequest createGroupRole(UserGroupRoleRequest UserGroupRoleRequest);

    // 更新User權限
    UserGroupRoleRequest updateUserGroupRole(UUID externalID, UserGroupRoleRequest userGroupRoleRequest);

    // 刪除User權限
    void deleteUserGroupRole(UUID externalID);



}
