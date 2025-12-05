package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.GroupDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Service.LineVerificationService;
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

    @Autowired
    private LineVerificationService lineVerificationService;


    @Override
    public List<GroupDTO> getUserGroup() {
        return userGroupRoleRepository.findDistinctGroups();
    }

    //取得該群組的所有使用者權限
    @Override
    public List<UserGroupRoleDTO> getUserGroup(String groupID) {
        List<UserGroupRole> userGroupRole = userGroupRoleRepository.findUserGroupRolesByGroupID(groupID);

        // ✅ 建構子轉換 Entity → DTO，並在 DTO 層面補充 lineNiceName
        return userGroupRole.stream()
                .map(entity -> {
                    UserGroupRoleDTO dto = new UserGroupRoleDTO(entity);

                    // ✅ 如果 lineNiceName 為空，在 DTO 中補上 userName
                    if (dto.getLineNiceName() == null || dto.getLineNiceName().isEmpty()) {
                        dto.setLineNiceName(dto.getUserName());
                        System.out.println("📝 DTO 層補充 lineNiceName: " + dto.getUserName());
                    }

                    return dto;
                })
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
        userGroupRole.setLineNiceName(userGroupRoleDTO.getLineNiceName());
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

            // ✅ 如果是第一次更新且 lineNiceName 為空，先記錄原始名稱
            if (existing.getLineNiceName() == null || existing.getLineNiceName().isEmpty()) {
                existing.setLineNiceName(existing.getUserName());
            }

            existing.setLineID(userGroupRoleDTO.getLineID());
            existing.setUserName(userGroupRoleDTO.getUserName());
            existing.setUserNameID(userGroupRoleDTO.getUserNameID());
            existing.setGroupID(userGroupRoleDTO.getGroupID());
            existing.setGroupName(userGroupRoleDTO.getGroupName());
            existing.setGroupNameID(userGroupRoleDTO.getGroupNameID());
            existing.setRoleID(userGroupRoleDTO.getRoleID());

            // ✅ lineNiceName 不更新，除非 DTO 有提供且原本是空的
            if (userGroupRoleDTO.getLineNiceName() != null && !userGroupRoleDTO.getLineNiceName().isEmpty()) {
                if (existing.getLineNiceName() == null || existing.getLineNiceName().isEmpty()) {
                    existing.setLineNiceName(userGroupRoleDTO.getLineNiceName());
                }
            }

            UserGroupRole updated = userGroupRoleRepository.save(existing);
            return new UserGroupRoleDTO(updated);
        }catch (Exception e){
            throw new EntityNotFoundException("UserGroupRole not found: " + externalID);
        }
    }

    @Transactional
    public void updateGroupName(List<String> groupIDs, List<String> newGroupNames) {

        if (groupIDs.size() != newGroupNames.size()) {
            throw new IllegalArgumentException("groupIDs 和 newGroupNames 數量不一致");
        }
        for (int i = 0; i < groupIDs.size(); i++) {
            String groupID = groupIDs.get(i);

            // 根據群組ID找到最多群組名稱的
            String oGroupName = userGroupRoleRepository.findTopGroupNameByGroupID(groupID);
            String newGroupName = newGroupNames.get(i);
            String[] parts = newGroupName.split("-", 2);
            String groupNameID = parts[0].trim();
            String groupName = "";
            if (parts[1].trim().equals("業務")) {
                 groupName = (parts.length > 1 ? parts[1].trim() : "") + "-" + oGroupName;
            }else{
                groupName = (parts.length > 1 ? parts[1].trim() : "");
            }

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

                    if (userGroupRole.getLineNiceName() == null || userGroupRole.getLineNiceName().isEmpty()) {
                        userGroupRole.setLineNiceName(userGroupRole.getUserName());
                        System.out.println("   📝 補充 lineNiceName: " + userGroupRole.getUserName());
                    }

                    userGroupRole.setRoleID(dto.getRoleID());
                    // 安全的 trim 處理
                    userGroupRole.setGroupName(dto.getGroupName() != null ?
                            dto.getGroupName().trim() : null);
                    userGroupRole.setUserNameID(dto.getUserNameID() != null ?
                            dto.getUserNameID().trim() : null);
                    userGroupRole.setUserName(dto.getUserName() != null ?
                            dto.getUserName().trim() : null);

                    if (dto.getLineNiceName() != null && !dto.getLineNiceName().isEmpty()) {
                        // 只在第一次設定時允許更新
                        if (userGroupRole.getLineNiceName() == null || userGroupRole.getLineNiceName().isEmpty()) {
                            userGroupRole.setLineNiceName(dto.getLineNiceName().trim());
                        }
                    }

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

    //-----------------------------------------------------------------------------------------------------------------------------------------


    /**
     * 根據 Access Token 取得使用者角色資訊
     */
    @Transactional(readOnly = true)
    public UserGroupRoleDTO getUserRoleByAccessToken(String authHeader, String groupIdFromClient) {

        // 1. 驗證 Authorization Header 格式
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid Authorization Header");
        }

        String accessToken = authHeader.substring(7);

        // 2. 呼叫 LINE API 驗證 Access Token 並取得真實的 LINE User ID
        String lineId = lineVerificationService.verifyAccessTokenAndGetUserId(accessToken);

        if (lineId == null || lineId.trim().isEmpty()) {
            throw new SecurityException("無效的 Access Token");
        }

        // 3. 驗證必須有 Group ID
        if (groupIdFromClient == null || groupIdFromClient.trim().isEmpty()) {
            throw new IllegalArgumentException("必須從群組開啟 LIFF，缺少 Group ID");
        }

        // 4. 用 LineID + GroupID 查詢使用者角色
        UserGroupRole userGroupRole = getUserGroupRoleByLineIdAndGroupId(lineId, groupIdFromClient);

        if (userGroupRole == null) {
            throw new RuntimeException("使用者不存在或未授權此群組");
        }

        // 5. 轉換成 DTO 並回傳
        return new UserGroupRoleDTO(userGroupRole);
    }

    /**
     * 根據 LineID + GroupID 查詢（精確查詢）
     */
    public UserGroupRole getUserGroupRoleByLineIdAndGroupId(String lineId, String groupId) {
        return userGroupRoleRepository.findByLineIDAndGroupID(lineId, groupId);
    }
}