package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.GroupRoleRepository;
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
    private GroupRoleRepository groupRoleRepository;

    @Autowired
    private UserGroupRoleRepository userGroupRoleRepository;


    //取得所有群組權限
    @Override
    public List<GroupRoleRequest> getAllGroupRole() {
        List<GroupRole> groupRole = groupRoleRepository.findAll();

        // 建構子轉換 Entity ➝ DTO
        return groupRole.stream()
                .map(GroupRoleRequest::new)
                .collect(Collectors.toList());
    }

    // 取得單筆群組權限
    @Override
    public GroupRoleRequest getGroupRoleByGroupID(String groupID) {
        GroupRole groupRole = groupRoleRepository.findGroupRoleByGroupID(groupID);
        return new GroupRoleRequest(groupRole); // 手動轉 DTO
    }

    //新增群組權限
    @Override
    public GroupRoleRequest createGroupRole(GroupRoleRequest groupRoleRequest) {
        // 將 DTO 轉成 Entity
        GroupRole groupRole = new GroupRole();
        groupRole.setRoleID(groupRoleRequest.getRoleID());

        // 儲存 Entity
        GroupRole saved = groupRoleRepository.save(groupRole);

        // 回傳 DTO
        return new GroupRoleRequest(saved);
    }


    //更新群組權限
    @Override
    public GroupRoleRequest updateGroupRole(String groupID, GroupRoleRequest groupRoleRequest) {

        try{
            GroupRole existing = groupRoleRepository.findGroupRoleByGroupID(groupID);

            existing.setGroupName(groupRoleRequest.getGroupName());
            existing.setDescription(groupRoleRequest.getDescription());
            existing.setRoleID(groupRoleRequest.getRoleID());

            GroupRole updated = groupRoleRepository.save(existing);
            return new GroupRoleRequest(updated);
        }catch (Exception e){
            new EntityNotFoundException("Group not found: " + groupID);
        }
        return groupRoleRequest;
    }

    //刪除群組權限
    @Override
    public void deleteGroupRole(String groupID) {
        groupRoleRepository.deleteGroupRoleByGroupID(groupID);
    }

    //--------------------------------------------------------------------------------------------------------------------------------------------


    //取得所有使用者權限
    @Override
    public List<UserGroupRoleRequest> getAllUserGroupRole() {
        List<UserGroupRole> userGroupRole = userGroupRoleRepository.findAll();

        // 建構子轉換 Entity ➝ DTO
        return userGroupRole.stream()
                .map(UserGroupRoleRequest::new)
                .collect(Collectors.toList());
    }

    // 取得單筆使用者權限
    @Override
    public UserGroupRoleRequest getUserGroupRoleByExternalID(UUID externalID) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findUserGroupRoleByExternalID(externalID);
        return new UserGroupRoleRequest(userGroupRole); // 手動轉 DTO
    }

    //新增使用者權限
    @Override
    public UserGroupRoleRequest createGroupRole(UserGroupRoleRequest UserGroupRoleRequest) {
        // 將 DTO 轉成 Entity
        UserGroupRole userGroupRole = new UserGroupRole();
        userGroupRole.setGroupID(UserGroupRoleRequest.getGroupID());


        // 儲存 Entity
        UserGroupRole saved = userGroupRoleRepository.save(userGroupRole);

        // 回傳 DTO
        return new UserGroupRoleRequest(saved);
    }


    //更新使用者權限
    @Override
    public UserGroupRoleRequest updateUserGroupRole(UUID externalID, UserGroupRoleRequest userGroupRoleRequest) {

        try{
            UserGroupRole existing = userGroupRoleRepository.findUserGroupRoleByExternalID(externalID);

            existing.setRoleID(userGroupRoleRequest.getRoleID());

            UserGroupRole updated = userGroupRoleRepository.save(existing);
            return new UserGroupRoleRequest(updated);
        }catch (Exception e){
            new EntityNotFoundException("UserGroupRole not found: ");
        }
        return userGroupRoleRequest;
    }

    //刪除使用者權限
    @Override
    public void deleteUserGroupRole(UUID externalID) {
        userGroupRoleRepository.deleteUserGroupRoleByExternalID(externalID);
    }


}
