package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Service.JwtService;
import com.zj.nld.Service.UserGroupRoleService;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        }else {
            return null;
        }
    }


    // 在UserGroupRole根據lineID與groupID取得對應的權限ID
    @Override
    public UserGroupRole findByLineID(String lineId) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findByLineID(lineId);
        if (userGroupRole != null) {
            return userGroupRole;
        }else {
            return null;
        }
    }

    public boolean updateUserGroupRole(UserGroupRole userGroupRole) {
        try {
            userGroupRoleRepository.save(userGroupRole);
            return true;
        }catch (Exception e) {
            return false;
        }
    }

    //刪除群組
    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteGroupRoleByGroupID(String groupID){
        userGroupRoleRepository.deleteUserGroupRoleByGroupID(groupID);
    }

    // 在GroupRole根據groupID取得對應的權限ID
    @Override
    public UserGroupRole getGroupRoleByGroupID(String groupID) {
        UserGroupRole groupRole = userGroupRoleRepository.findUserGroupRoleByGroupID(groupID);
        if (groupRole != null) {
            return groupRole;
        }else{
            return null;
        }
    }


    @Override
    public List<UserGroupRole> getAdminByToken(String token) {
        jwtService.isTokenValid(token);
        Claims claims = jwtService.parseToken(token);
        //從token讀取lineId
        String lineId = claims.get("lineId", String.class);
        //從token讀取groupId
        String groupId = claims.get("groupId", String.class);

        //從token讀取roleId
        int roleId = claims.get("roleId", Integer.class);


        // 找到該user所在的group可使用的權限
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupId);



        if (((groupId == null) && (userGroupRole.getRoleID() == roleId)) ||
                ((UserGroupRole.getRoleID() == userGroupRole.getRoleID()) &&
                        (userGroupRole.getRoleID() == roleId) &&
                        (groupRole.getRoleID() == roleId)))
        {
            return switch (roleId) {
                // 管理者
                case 1 -> userGroupRoleRepository.findAll();
                default -> null;
            };
        }
        throw new RuntimeException("驗證失敗");
    }




    @Override
    @org.springframework.transaction.annotation.Transactional
    public List<UserGroupRole> updateGroupRoles(List<UserGroupRoleRequest> groupRolesDTO) {

        List<UserGroupRole> updatedEntities = Collections.emptyList();
        List<String> groupIds = groupRolesDTO.stream()
                .map(UserGroupRoleRequest::getGroupID)
                .toList();
        List<UserGroupRole> roles = userGroupRoleRepository.findByGroupIDIn(groupIds);

        Map<String, UserGroupRole> groupRoleMap = roles.stream()
                .collect(Collectors.toMap(UserGroupRole::getGroupID, Function.identity()));

        for (UserGroupRoleRequest req : userGroupRoleDTO){
            UserGroupRole role = groupRoleMap.get(req.getGroupID());
            if (role != null){
                role.setRoleID(req.getRoleID());
                role.setGroupName(req.getGroupName());
            }
        }

        updatedEntities = userGroupRoleRepository.saveAll(roles);
        return updatedEntities;


    }
}
