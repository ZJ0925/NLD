package com.zj.nld.Service;

import com.zj.nld.Model.DTO.UserGroupRoleRequest;

import java.util.List;
import java.util.UUID;

public interface RoleService {

    // 取得所有使用者權限
    List<UserGroupRoleRequest> getAllUserGroupRole();

    // 取得單筆使用者權限 (by externalID)
    UserGroupRoleRequest getUserGroupRoleByExternalID(UUID externalID);

    // 取得單筆群組權限 (by groupID)
    UserGroupRoleRequest getUserGroupRoleByGroupID(String groupID);

    // 新增使用者權限
    UserGroupRoleRequest createUserGroupRole(UserGroupRoleRequest userGroupRoleRequest);

    // 更新使用者權限 (by externalID)
    UserGroupRoleRequest updateUserGroupRole(UUID externalID, UserGroupRoleRequest userGroupRoleRequest);

    // 更新群組權限 (by groupID)
    UserGroupRoleRequest updateUserGroupRoleByGroupID(String groupID, UserGroupRoleRequest userGroupRoleRequest);

    // 刪除使用者權限 (by externalID)
    void deleteUserGroupRole(UUID externalID);

    // 刪除群組權限 (by groupID)
    void deleteUserGroupRoleByGroupID(String groupID);
}