package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.GroupRequest;
import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Service.RoleService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private UserGroupRoleRepository userGroupRoleRepository;


    @Override
    public List<GroupRequest> getUserGroup() {
        return userGroupRoleRepository.findDistinctGroups();
    }

    //取得該群組的所有使用者權限
    @Override
    public List<UserGroupRoleRequest> getUserGroup(String groupID) {
        List<UserGroupRole> entities = userGroupRoleRepository.findUserGroupRolesByGroupID(groupID);

        // 建構子轉換 Entity → DTO
        return entities.stream()
                .map(UserGroupRoleRequest::new) // 直接 new DTO
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

    @Transactional
    public List<UserGroupRoleRequest> updateGroupName(String groupID, String newGroupName) {
        // 更新所有對應的 UserGroupRole
        userGroupRoleRepository.updateGroupNameByGroupID(groupID, newGroupName);

        // 取得更新後的資料
        List<UserGroupRole> roles = userGroupRoleRepository.findByGroupID(groupID);

        // 轉成 DTO
        return roles.stream()
                .map(UserGroupRoleRequest::new)
                .collect(Collectors.toList());
    }


    //刪除使用者權限 (by externalID)
    @Override
    public void deleteUserGroupRole(UUID externalID) {
        userGroupRoleRepository.deleteUserGroupRoleByExternalID(externalID);
    }

    @Override
    public List<UserGroupRole> updateUserGroupRoles(List<UserGroupRoleRequest> userGroupRoleDTOs) {
        List<UserGroupRole> updatedRoles = new ArrayList<>();

        for (UserGroupRoleRequest dto : userGroupRoleDTOs) {
            try {
                UserGroupRole userGroupRole = userGroupRoleRepository.findByLineIDAndGroupID(dto.getLineID(), dto.getGroupID());

                if (userGroupRole != null) {
                    userGroupRole.setRoleID(dto.getRoleID());
                    userGroupRole.setGroupName(dto.getGroupName());
                    userGroupRoleRepository.save(userGroupRole);

                    updatedRoles.add(userGroupRole); // 更新成功才加到結果
                } else {
                    // 找不到的處理方式：可以忽略、丟例外、或直接建立新資料
                    // 這裡我先選擇忽略
                    System.out.println("UserGroupRole not found for lineID: " + dto.getLineID());
                }

            } catch (Exception e) {
                // 出錯時紀錄 log，繼續跑下一筆
                System.err.println("Error updating UserGroupRole for lineID: " + dto.getLineID() + " - " + e.getMessage());
            }
        }

        return updatedRoles;
    }
}