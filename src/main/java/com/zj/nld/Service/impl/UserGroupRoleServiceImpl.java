package com.zj.nld.Service.impl;

import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Service.UserGroupRoleService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class UserGroupRoleServiceImpl implements UserGroupRoleService {

    @Autowired
    private UserGroupRoleRepository userGroupRoleRepository;


    //將新用戶加入權限
    @Override
    public UserGroupRole ceateUserGroupRole(UserGroupRole userGroupRole) {
        return userGroupRoleRepository.save(userGroupRole);
    }

    //將用戶從群組刪除權限(確保不是直接在 Controller 裡刪資料，而是呼叫@Transactional 的 Service 方法。)
    @Transactional
    @Override
    public void deleteUserGroupRole(String lineID, String groupID) {
        userGroupRoleRepository.deleteUserGroupRoleByLineIDAndGroupID(lineID, groupID);
    }
}
