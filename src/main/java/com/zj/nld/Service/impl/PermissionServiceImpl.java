package com.zj.nld.Service.impl;

import com.zj.nld.Model.GroupRole;
import com.zj.nld.Model.UserGroupRole;
import com.zj.nld.Repository.JpaRepository.GroupRoleRepositoroy;
import com.zj.nld.Repository.JpaRepository.UserGroupRoleRepository;
import com.zj.nld.Service.PermissionService;
import org.springframework.stereotype.Service;

@Service
public class PermissionServiceImpl implements PermissionService {


    private final UserGroupRoleRepository userGroupRoleRepository;

    private final GroupRoleRepositoroy groupRoleRepositoroy;

    public PermissionServiceImpl(UserGroupRoleRepository userGroupRoleRepository, GroupRoleRepositoroy groupRoleRepositoroy) {
        this.userGroupRoleRepository = userGroupRoleRepository;
        this.groupRoleRepositoroy = groupRoleRepositoroy;
    }

    // 在UserGroupRole根據lineID與groupID取得對應的權限ID
    public UserGroupRole getRoleId(String lineId, String groupId) {
        return  userGroupRoleRepository.findByLineIDAndGroupID(lineId, groupId);
    }

    public GroupRole getGroupRoleByGroupID(String groupID) {
        return groupRoleRepositoroy.findGroupRoleByGroupID(groupID);
    }




}
