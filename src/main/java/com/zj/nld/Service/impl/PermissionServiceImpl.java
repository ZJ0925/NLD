package com.zj.nld.Service.impl;

import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.GroupRoleRepository;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Service.PermissionService;
import org.springframework.stereotype.Service;

@Service
public class PermissionServiceImpl implements PermissionService {


    private final UserGroupRoleRepository userGroupRoleRepository;

    private final GroupRoleRepository groupRoleRepository;

    public PermissionServiceImpl(UserGroupRoleRepository userGroupRoleRepository, GroupRoleRepository groupRoleRepository) {
        this.userGroupRoleRepository = userGroupRoleRepository;
        this.groupRoleRepository = groupRoleRepository;
    }

    // 在UserGroupRole根據lineID與groupID取得對應的權限ID
    public UserGroupRole getRoleId(String lineId, String groupId) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findByLineIDAndGroupID(lineId, groupId);
        if (userGroupRole != null) {
            return userGroupRole;
        }else {
            return null;
        }
    }

    // 在UserGroupRole根據lineID與groupID取得對應的權限ID
    public UserGroupRole findByLineID(String lineId) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findByLineID(lineId);
        if (userGroupRole != null) {
            return userGroupRole;
        }else {
            return null;
        }
    }

    // // 在GroupRole根據groupID取得對應的權限ID
    public GroupRole getGroupRoleByGroupID(String groupID) {
        GroupRole groupRole = groupRoleRepository.findGroupRoleByGroupID(groupID);
        if (groupRole != null) {
            return groupRole;
        }else{
            return null;
        }
    }
}
