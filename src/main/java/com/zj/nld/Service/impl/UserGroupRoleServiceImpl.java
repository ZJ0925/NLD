package com.zj.nld.Service.impl;


import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Service.LineVerificationService;
import com.zj.nld.Service.RoleManagerService;
import com.zj.nld.Service.UserGroupRoleService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;


@Service
public class UserGroupRoleServiceImpl implements UserGroupRoleService {

    @Autowired
    private UserGroupRoleRepository userGroupRoleRepository;

    @Autowired
    private LineVerificationService lineVerificationService;

    @Autowired
    private RoleManagerService roleManagerService;


    @Override
    public List<UserGroupRole> findByGroupID(String groupID) {
        return userGroupRoleRepository.findByGroupID(groupID);
    }

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


    /**
     * 驗證使用者是否為超級管理員
     * 透過 Authorization Header 中的 Access Token 驗證
     */
    @Override
    public boolean findRoleManagerByauthHeader(String authHeader) {
        // 1. 從 Header 提取 Access Token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String accessToken = authHeader.substring(7);

        // 2. 透過 LINE API 驗證 Token 並取得真實的 User ID
        String lineID = lineVerificationService.verifyAccessTokenAndGetUserId(accessToken);
        
        if (roleManagerService.isRoleManagerByLineID(lineID)) {
            return true;
        }else{
            return false;
        }
    }
    /**
     * 取得所有不重複的群組 ID
     */
    @Override
    public List<String> getAllGroupIds() {
        return userGroupRoleRepository.findAllDistinctGroupIds();
    }

    /**
     * 更新指定群組的名稱
     */
    @Override
    @Transactional
    public boolean updateGroupName(String groupId, String newGroupName) {
        try {
            int updatedCount = userGroupRoleRepository.updateGroupNameByGroupId(groupId, newGroupName);
            return updatedCount > 0;
        } catch (Exception e) {
            System.err.println("更新群組名稱失敗: " + groupId + " - " + e.getMessage());
            return false;
        }
    }

    /**
     * 從資料庫取得群組名稱
     */
    @Override
    public String getGroupNameFromDB(String groupId) {
        try {
            return userGroupRoleRepository.findGroupNameByGroupId(groupId);
        } catch (Exception e) {
            System.err.println("從資料庫取得群組名稱失敗: " + groupId + " - " + e.getMessage());
            return null;
        }
    }

}