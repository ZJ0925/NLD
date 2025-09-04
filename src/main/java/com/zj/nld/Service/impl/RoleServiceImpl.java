package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.GroupDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
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
    public List<GroupDTO> getUserGroup() {
        return userGroupRoleRepository.findDistinctGroups();
    }

    //取得該群組的所有使用者權限
    @Override
    public List<UserGroupRoleDTO> getUserGroup(String groupID) {
        List<UserGroupRole> userGroupRole = userGroupRoleRepository.findUserGroupRolesByGroupID(groupID);

        // 建構子轉換 Entity → DTO
        return userGroupRole.stream()
                .map(UserGroupRoleDTO::new) // 直接 new DTO
                .collect(Collectors.toList());
    }

    // 取得單筆使用者權限 (by externalID)
    @Override
    public UserGroupRoleDTO getUserGroupRoleByExternalID(UUID externalID) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findUserGroupRoleByExternalID(externalID);
        if (userGroupRole != null) {
            return new UserGroupRoleDTO(userGroupRole); // 手動轉 DTO
        }
        return null;
    }

    //新增使用者權限
    @Override
    public UserGroupRoleDTO createUserGroupRole(UserGroupRoleDTO userGroupRoleDTO) {
        // 將 DTO 轉成 Entity
        UserGroupRole userGroupRole = new UserGroupRole();
        userGroupRole.setExternalID(userGroupRoleDTO.getExternalID());
        userGroupRole.setLineID(userGroupRoleDTO.getLineID());
        userGroupRole.setUserName(userGroupRoleDTO.getUserName());
        userGroupRole.setGroupID(userGroupRoleDTO.getGroupID());
        userGroupRole.setGroupName(userGroupRoleDTO.getGroupName());
        userGroupRole.setRoleID(2);

        // 儲存 Entity
        UserGroupRole saved = userGroupRoleRepository.save(userGroupRole);

        // 回傳 DTO
        return new UserGroupRoleDTO(saved);
    }

    //更新使用者權限 (by externalID)
    @Override
    public UserGroupRoleDTO updateUserGroupRole(UUID externalID, UserGroupRoleDTO userGroupRoleDTO) {
        try{
            UserGroupRole existing = userGroupRoleRepository.findUserGroupRoleByExternalID(externalID);
            if (existing == null) {
                throw new EntityNotFoundException("UserGroupRole not found: " + externalID);
            }

            existing.setLineID(userGroupRoleDTO.getLineID());
            existing.setUserName(userGroupRoleDTO.getUserName());
            existing.setGroupID(userGroupRoleDTO.getGroupID());
            existing.setGroupName(userGroupRoleDTO.getGroupName());
            existing.setRoleID(userGroupRoleDTO.getRoleID());

            UserGroupRole updated = userGroupRoleRepository.save(existing);
            return new UserGroupRoleDTO(updated);
        }catch (Exception e){
            throw new EntityNotFoundException("UserGroupRole not found: " + externalID);
        }
    }

    @Transactional
    public void updateGroupName(List<String> groupIDs, List<String> newGroupNames) {
        System.out.println("updateGroupName 被呼叫"); // 確認方法進來
        if (groupIDs.size() != newGroupNames.size()) {
            throw new IllegalArgumentException("groupIDs 和 newGroupNames 數量不一致");
        }
        for (int i = 0; i < groupIDs.size(); i++) {
            String groupID = groupIDs.get(i);
            String newGroupName = newGroupNames.get(i);
            String[] parts = newGroupName.split("-", 2);
            String groupNameID = parts[0].trim();
            String groupName = (parts.length > 1 ? parts[1].trim() : "");
            System.out.println("更新 groupID=" + groupID + ", groupNameID=" + groupNameID + ", groupName=" + groupName);
            userGroupRoleRepository.updateGroupNameAndIDByGroupIDNative(groupID, groupName, groupNameID);
        }
    }


    //刪除使用者權限 (by externalID)
    @Override
    public void deleteUserGroupRole(UUID externalID) {
        userGroupRoleRepository.deleteUserGroupRoleByExternalID(externalID);
    }

    @Override
    public List<UserGroupRole> updateUserGroupRoles(List<UserGroupRoleDTO> userGroupRoleDTOs) {
        List<UserGroupRole> updatedRoles = new ArrayList<>();

        for (UserGroupRoleDTO dto : userGroupRoleDTOs) {
            try {
                UserGroupRole userGroupRole = userGroupRoleRepository.findByLineIDAndGroupID(dto.getLineID(), dto.getGroupID());

                if (userGroupRole != null) {
                    userGroupRole.setRoleID(dto.getRoleID());
                    userGroupRole.setGroupName(dto.getGroupName());
                    userGroupRole.setUserName(dto.getUserName());
                    userGroupRoleRepository.save(userGroupRole);

                    updatedRoles.add(userGroupRole); // 更新成功才加到結果
                } else {
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