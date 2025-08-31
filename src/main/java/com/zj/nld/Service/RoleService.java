package com.zj.nld.Service;

import com.zj.nld.Model.DTO.GroupDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
import com.zj.nld.Model.Entity.UserGroupRole;

import java.util.List;
import java.util.UUID;

public interface RoleService {


    List<GroupDTO> getUserGroup();

    // 取得所有使用者權限
    List<UserGroupRoleDTO> getUserGroup(String groupID);

    // 取得單筆使用者權限 (by externalID)
    UserGroupRoleDTO getUserGroupRoleByExternalID(UUID externalID);


    // 新增使用者權限
    UserGroupRoleDTO createUserGroupRole(UserGroupRoleDTO userGroupRoleDTO);

    // 更新使用者權限 (by externalID)
    UserGroupRoleDTO updateUserGroupRole(UUID externalID, UserGroupRoleDTO userGroupRoleDTO);

    // 刪除使用者權限 (by externalID)
    void deleteUserGroupRole(UUID externalID);

    //批量更新
    List<UserGroupRole> updateUserGroupRoles(List<UserGroupRoleDTO> groupRolesDTO);

    //批量更新群組名稱
    List<GroupDTO> updateGroupName(List<String> groupIDs, List<String> newGroupNames);

}