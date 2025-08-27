package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Service.RoleService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private UserGroupRoleRepository userGroupRoleRepository;

    //取得所有使用者權限
    @Override
    public List<UserGroupRoleRequest> getAllUserGroupRole() {
        List<UserGroupRole> userGroupRole = userGroupRoleRepository.findAll();

        // 建構子轉換 Entity → DTO
        return userGroupRole.stream()
                .map(UserGroupRoleRequest::new)
                .collect(Collectors.toList());
    }

    // 取得單筆使用者權限 (by externalID)
    @Override
    public UserGroupRoleRequest getUserGroupRoleByExternalID(UUID externalID) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findUserGroupRoleByExternalID(externalID);
        if (userGroupRole != null) {
            return new UserGroupRoleRequest(userGroupRole); // 手動轉 DTO
        }
        return null;
    }

    // 取得單筆群組權限 (by groupID)
    @Override
    public UserGroupRoleRequest getUserGroupRoleByGroupID(String groupID) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findUserGroupRoleByGroupID(groupID);
        if (userGroupRole != null) {
            return new UserGroupRoleRequest(userGroupRole); // 手動轉 DTO
        }
        return null;
    }

    //新增使用者權限
    @Override
    public UserGroupRoleRequest createUserGroupRole(UserGroupRoleRequest userGroupRoleRequest) {
        // 將 DTO 轉成 Entity
        UserGroupRole userGroupRole = new UserGroupRole();
        userGroupRole.setExternalID(userGroupRoleRequest.getExternalID());
        userGroupRole.setLineID(userGroupRoleRequest.getLineID());
        userGroupRole.setUserName(userGroupRoleRequest.getUserName());
        userGroupRole.setGroupID(userGroupRoleRequest.getGroupID());
        userGroupRole.setGroupName(userGroupRoleRequest.getGroupName());
        userGroupRole.setRoleID(2);

        // 儲存 Entity
        UserGroupRole saved = userGroupRoleRepository.save(userGroupRole);

        // 回傳 DTO
        return new UserGroupRoleRequest(saved);
    }

    //更新使用者權限 (by externalID)
    @Override
    public UserGroupRoleRequest updateUserGroupRole(UUID externalID, UserGroupRoleRequest userGroupRoleRequest) {
        try{
            UserGroupRole existing = userGroupRoleRepository.findUserGroupRoleByExternalID(externalID);
            if (existing == null) {
                throw new EntityNotFoundException("UserGroupRole not found: " + externalID);
            }

            existing.setLineID(userGroupRoleRequest.getLineID());
            existing.setUserName(userGroupRoleRequest.getUserName());
            existing.setGroupID(userGroupRoleRequest.getGroupID());
            existing.setGroupName(userGroupRoleRequest.getGroupName());
            existing.setRoleID(userGroupRoleRequest.getRoleID());

            UserGroupRole updated = userGroupRoleRepository.save(existing);
            return new UserGroupRoleRequest(updated);
        }catch (Exception e){
            throw new EntityNotFoundException("UserGroupRole not found: " + externalID);
        }
    }

    //更新群組權限 (by groupID)
    @Override
    public UserGroupRoleRequest updateUserGroupRoleByGroupID(String groupID, UserGroupRoleRequest userGroupRoleRequest) {
        try{
            UserGroupRole existing = userGroupRoleRepository.findUserGroupRoleByGroupID(groupID);
            if (existing == null) {
                throw new EntityNotFoundException("UserGroupRole not found for groupID: " + groupID);
            }

            existing.setGroupName(userGroupRoleRequest.getGroupName());
            existing.setRoleID(userGroupRoleRequest.getRoleID());

            UserGroupRole updated = userGroupRoleRepository.save(existing);
            return new UserGroupRoleRequest(updated);
        }catch (Exception e){
            throw new EntityNotFoundException("UserGroupRole not found for groupID: " + groupID);
        }
    }

    //刪除使用者權限 (by externalID)
    @Override
    public void deleteUserGroupRole(UUID externalID) {
        userGroupRoleRepository.deleteUserGroupRoleByExternalID(externalID);
    }

    //刪除群組權限 (by groupID)
    @Override
    public void deleteUserGroupRoleByGroupID(String groupID) {
        userGroupRoleRepository.deleteUserGroupRoleByGroupID(groupID);
    }
}