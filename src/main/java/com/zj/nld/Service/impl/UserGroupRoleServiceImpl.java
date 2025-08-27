package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Service.JwtService;
import com.zj.nld.Service.UserGroupRoleService;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UserGroupRoleServiceImpl implements UserGroupRoleService {

    @Autowired
    private UserGroupRoleRepository userGroupRoleRepository;

    @Autowired
    private JwtService jwtService;

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

    // 在UserGroupRole根據lineID與groupID取得對應的權限ID
    @Override
    public UserGroupRole getRoleId(String lineId, String groupId) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findByLineIDAndGroupID(lineId, groupId);
        if (userGroupRole != null) {
            return userGroupRole;
        } else {
            return null;
        }
    }

    // 在UserGroupRole根據lineID取得權限資料
    @Override
    public UserGroupRole findByLineID(String lineId) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findByLineID(lineId);
        if (userGroupRole != null) {
            return userGroupRole;
        } else {
            return null;
        }
    }

    public boolean updateUserGroupRole(UserGroupRole userGroupRole) {
        try {
            userGroupRoleRepository.save(userGroupRole);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    //刪除群組
    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteGroupRoleByGroupID(String groupID){
        userGroupRoleRepository.deleteUserGroupRoleByGroupID(groupID);
    }

    @Override
    public List<UserGroupRole> getAllRole() {
        return userGroupRoleRepository.findAll();
    }

}