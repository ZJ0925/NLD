package com.zj.nld.Service.impl;

import com.zj.nld.Model.UserGroupRole;
import com.zj.nld.Repository.JpaRepository.UserGroupRoleRepository;
import com.zj.nld.Service.PermissionService;
import org.springframework.stereotype.Service;

@Service
public class PermissionServiceImpl implements PermissionService {

    private final UserGroupRoleRepository userGroupRoleRepository;

    public PermissionServiceImpl(UserGroupRoleRepository userGroupRoleRepository) {
        this.userGroupRoleRepository = userGroupRoleRepository;
    }

    // 根據lineID與groupID取得對應的權限ID
    public UserGroupRole getRoleId(String lineId, String groupId) {
        return  userGroupRoleRepository.findByLineIDAndGroupID(lineId, groupId);
    }


}
