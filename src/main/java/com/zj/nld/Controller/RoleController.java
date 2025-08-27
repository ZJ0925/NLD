package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.GroupRequest;
import com.zj.nld.Model.DTO.UserGroupRoleRequest;
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
    public ResponseEntity<List<GroupRequest>> getAllGroups(){
        List<GroupRequest>  groups = roleService.getUserGroup();

        if(!groups.isEmpty()){
            return new ResponseEntity<>(groups, HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    // 取得該群組的所有使用者權限
    @GetMapping("/GET/UserGroup")
    public ResponseEntity<List<UserGroupRoleRequest>> getUserGroup(String groupID) {
        List<UserGroupRoleRequest> userGroupRole = roleService.getUserGroup(groupID);

        if (userGroupRole != null && !userGroupRole.isEmpty()) {
            return ResponseEntity.ok(userGroupRole);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 取得單筆使用者權限
    @GetMapping("/GET/UserGroupRole/{externalID}")
    public ResponseEntity<UserGroupRoleRequest> GetUserGroupRole(@PathVariable UUID externalID) {
        UserGroupRoleRequest userGroupRole = roleService.getUserGroupRoleByExternalID(externalID);

        if (userGroupRole != null) {
            return ResponseEntity.ok(userGroupRole);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    // 更新使用者權限
    @PutMapping("/PUT/UserGroupRole/{externalID}")
    public ResponseEntity<UserGroupRoleRequest> UpdateUserGroupRole(@PathVariable UUID externalID, @RequestBody UserGroupRoleRequest userGroupRoleRequest) {

        UserGroupRoleRequest userGroupRole = roleService.getUserGroupRoleByExternalID(externalID);
        if (userGroupRole != null) {
            UserGroupRoleRequest updated = roleService.updateUserGroupRole(externalID, userGroupRoleRequest);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //批量更新
    @PutMapping("update")
    public List<UserGroupRoleRequest> updateGroupRole(@RequestBody List<UserGroupRoleRequest> groupRolesDTO){
        List<UserGroupRole> updatedRoles = roleService.updateUserGroupRoles(groupRolesDTO);

        return updatedRoles.stream()
                .map(UserGroupRoleRequest::new)
                .collect(Collectors.toList());
    }


}