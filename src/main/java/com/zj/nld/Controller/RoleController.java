package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.GroupDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Service.RoleService;
import com.zj.nld.Service.UserGroupRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/Role")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserGroupRoleService userGroupRoleService;

    @GetMapping("/Admin")
    public ResponseEntity<List<GroupDTO>> getAllGroups(){
        List<GroupDTO>  groups = roleService.getUserGroup();

        if(!groups.isEmpty()){
            return new ResponseEntity<>(groups, HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    // 取得該群組的所有使用者權限
    @GetMapping("/GET/UserGroup")
    public ResponseEntity<List<UserGroupRoleDTO>> getUserGroup(String groupID) {
        List<UserGroupRoleDTO> userGroupRole = roleService.getUserGroup(groupID);

        if (userGroupRole != null && !userGroupRole.isEmpty()) {
            return ResponseEntity.ok(userGroupRole);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 取得單筆使用者權限
    @GetMapping("/GET/UserGroupRole/{externalID}")
    public ResponseEntity<UserGroupRoleDTO> GetUserGroupRole(@PathVariable UUID externalID) {
        UserGroupRoleDTO userGroupRole = roleService.getUserGroupRoleByExternalID(externalID);

        if (userGroupRole != null) {
            return ResponseEntity.ok(userGroupRole);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    // 更新使用者權限
    @PutMapping("/PUT/UserGroupRole/{externalID}")
    public ResponseEntity<UserGroupRoleDTO> UpdateUserGroupRole(@PathVariable UUID externalID, @RequestBody UserGroupRoleDTO userGroupRoleDTO) {

        UserGroupRoleDTO userGroupRole = roleService.getUserGroupRoleByExternalID(externalID);
        if (userGroupRole != null) {
            UserGroupRoleDTO updated = roleService.updateUserGroupRole(externalID, userGroupRoleDTO);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //批量更新
    @PutMapping("update")
    public List<UserGroupRoleDTO> updateGroupRole(@RequestBody List<UserGroupRoleDTO> groupRolesDTO){
        List<UserGroupRole> updatedRoles = roleService.updateUserGroupRoles(groupRolesDTO);

        return updatedRoles.stream()
                .map(UserGroupRoleDTO::new)
                .collect(Collectors.toList());
    }


    //批量更新群組名稱
    @PutMapping("/update/GroupName")
    public ResponseEntity<Void> updateGroupName(
            @RequestParam List<String> groupIDs,
            @RequestParam List<String> newGroupNames) {
       roleService.updateGroupName(groupIDs, newGroupNames);
        return ResponseEntity.ok().build();
    }


}