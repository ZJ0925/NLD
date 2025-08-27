package com.zj.nld.Service;

import com.zj.nld.Model.DTO.GroupRequest;
import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.UserGroupRole;

import java.util.List;
import java.util.UUID;

public interface RoleService {

    List<GroupRequest> getUserGroup();

    // 取得所有使用者權限
    List<UserGroupRoleRequest> getUserGroup(String groupID);

    // 取得單筆使用者權限 (by externalID)
    UserGroupRoleRequest getUserGroupRoleByExternalID(UUID externalID);


    // 新增使用者權限
    UserGroupRoleRequest createUserGroupRole(UserGroupRoleRequest userGroupRoleRequest);

    // 更新使用者權限 (by externalID)
    UserGroupRoleRequest updateUserGroupRole(UUID externalID, UserGroupRoleRequest userGroupRoleRequest);

    // 刪除使用者權限 (by externalID)
    void deleteUserGroupRole(UUID externalID);

    List<UserGroupRole> updateUserGroupRoles(List<UserGroupRoleRequest> groupRolesDTO);

}