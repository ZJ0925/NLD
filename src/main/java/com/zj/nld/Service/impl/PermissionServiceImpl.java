package com.zj.nld.Service.impl;

import com.zj.nld.Model.UserGroupRole;
import com.zj.nld.Repository.JpaRepository.UserGroupRoleRepository;
import com.zj.nld.Service.PermissionService;

public class PermissionServiceImpl implements PermissionService {

    private final UserGroupRoleRepository userGroupRoleRepository;

    public PermissionServiceImpl(UserGroupRoleRepository userGroupRoleRepository) {
        this.userGroupRoleRepository = userGroupRoleRepository;
    }

    public Integer getRoleId(String lineId, String groupId) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findByLineIDAndGroupID(lineId, groupId);
        return userGroupRole.getRoleID();
    }
}
