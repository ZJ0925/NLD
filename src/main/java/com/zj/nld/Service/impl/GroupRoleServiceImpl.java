package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.GroupRoleRepository;
import com.zj.nld.Service.GroupRoleService;
import com.zj.nld.Service.JwtService;
import com.zj.nld.Service.UserGroupRoleService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GroupRoleServiceImpl implements GroupRoleService {

    @Autowired
    private GroupRoleRepository groupRoleRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    UserGroupRoleService userGroupRoleService;


    @Override
    public GroupRole findGroupRoleByGroupID(String groupID){
        return groupRoleRepository.findGroupRoleByGroupID(groupID);
    }



    // 新增群組
    @Override
    public GroupRole createGroupRole(GroupRole groupRole){
        return groupRoleRepository.save(groupRole);
    }

    // 更新群組名稱
    @Override
    public boolean updateGroupRole(GroupRole groupRole){
        try {
            groupRoleRepository.save(groupRole);
            return true;
        }catch (Exception e){
            return false;
        }
    }


    //刪除群組
    @Override
    @Transactional
    public void deleteGroupRoleByGroupID(String groupID){
        groupRoleRepository.deleteGroupRoleByGroupID(groupID);
    }

    // 在GroupRole根據groupID取得對應的權限ID
    @Override
    public GroupRole getGroupRoleByGroupID(String groupID) {
        GroupRole groupRole = groupRoleRepository.findGroupRoleByGroupID(groupID);
        if (groupRole != null) {
            return groupRole;
        }else{
            return null;
        }
    }


    @Override
    public List<GroupRole> getAdminByToken(String token) {
        jwtService.isTokenValid(token);
        Claims claims = jwtService.parseToken(token);
        //從token讀取lineId
        String lineId = claims.get("lineId", String.class);
        //從token讀取groupId
        String groupId = claims.get("groupId", String.class);

        //從token讀取roleId
        int roleId = claims.get("roleId", Integer.class);

        // 找到Group可以使用的權限
        GroupRole groupRole = groupRoleRepository.findGroupRoleByGroupID(groupId);

        // 找到該user所在的group可使用的權限
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupId);



        if (((groupId == null) && (userGroupRole.getRoleID() == roleId)) ||
                ((groupRole.getRoleID() == userGroupRole.getRoleID()) &&
                        (userGroupRole.getRoleID() == roleId) &&
                        (groupRole.getRoleID() == roleId)))
        {
            return switch (roleId) {
                // 管理者
                case 1 -> groupRoleRepository.findAll();
                default -> null;
            };
        }
        throw new RuntimeException("驗證失敗");
    }




    @Override
    @Transactional
    public List<GroupRole> updateGroupRoles(List<GroupRoleRequest> groupRolesDTO) {

        List<GroupRole> updatedEntities = Collections.emptyList();
        List<String> groupIds = groupRolesDTO.stream()
                .map(GroupRoleRequest::getGroupID)
                .toList();
        List<GroupRole> roles = groupRoleRepository.findByGroupIDIn(groupIds);

        Map<String, GroupRole> groupRoleMap = roles.stream()
                .collect(Collectors.toMap(GroupRole::getGroupID, Function.identity()));

        for (GroupRoleRequest req : groupRolesDTO){
            GroupRole role = groupRoleMap.get(req.getGroupID());
            if (role != null){
                role.setRoleID(req.getRoleID());
                role.setGroupName(req.getGroupName());
            }
        }

        updatedEntities = groupRoleRepository.saveAll(roles);
        return updatedEntities;


    }
}
