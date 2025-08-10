package com.zj.nld.Controller;


import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/Role")
public class RoleController {

    @Autowired
    private RoleService roleService;



    // 取得所有群組權限
    @GetMapping("/GET/allGroupRole")
    public ResponseEntity<List<GroupRoleRequest>> getAllGroupRole() {
        List<GroupRoleRequest> groupRole = roleService.getAllGroupRole();

        if (groupRole != null && !groupRole.isEmpty()) {
            return ResponseEntity.ok(groupRole);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 取得單筆群組權限
    @GetMapping("/GET/GroupRole/{groupID}")
    public ResponseEntity<GroupRoleRequest> GetGroupRole(@PathVariable  String groupID) {
        GroupRoleRequest groupRole = roleService.getGroupRoleByGroupID(groupID);

        if (groupRole != null) {
            return ResponseEntity.ok(groupRole);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 新增群組權限
    @PostMapping("/POST/GroupRole")
    public ResponseEntity<GroupRoleRequest> CreatGroupRole(GroupRoleRequest groupRoleRequest) {
        GroupRoleRequest addGroupRole = roleService.createGroupRole(groupRoleRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(addGroupRole);
    }


    // 更新群組權限
    @PutMapping("/PUT/GroupRole/{groupID}")
    public ResponseEntity<GroupRoleRequest> UpdateGroupRole(@PathVariable  String groupID, GroupRoleRequest groupRoleRequest) {

        GroupRoleRequest groupRole = roleService.getGroupRoleByGroupID(groupID);
        if (groupRole != null) {
            GroupRoleRequest updated = roleService.updateGroupRole(groupID, groupRoleRequest);
            return ResponseEntity.ok(updated);
        }else{
            return ResponseEntity.notFound().build();
        }
    }


    // 刪除群組權限
    @DeleteMapping("/Delete/GroupRole/{groupID}")
    public ResponseEntity<Void> deleteGroupRole(@PathVariable String groupID) {
        GroupRoleRequest existing = roleService.getGroupRoleByGroupID(groupID);
        if (existing != null) {
            roleService.deleteGroupRole(groupID);
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    //------------------------------------------------------------------------------------------------------------------------

    // 取得所有使用者權限
    @GetMapping("/GET/allUserGroupRole")
    public ResponseEntity<List<UserGroupRoleRequest>> getAllUserGroupRole() {
        List<UserGroupRoleRequest> userGroupRole = roleService.getAllUserGroupRole();

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

    // 新增使用者權限
    @PostMapping("/POST/UserGroupRole")
    public ResponseEntity<UserGroupRoleRequest> CreatGroupRole(UserGroupRoleRequest userGroupRoleRequest) {
        UserGroupRoleRequest addUserGroupRole = roleService.createGroupRole(userGroupRoleRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(addUserGroupRole);
    }


    // 更新使用者權限
    @PutMapping("/PUT/UserGroupRole/{groupID}")
    public ResponseEntity<UserGroupRoleRequest> UpdateGroupRole(@PathVariable  UUID externalID, UserGroupRoleRequest userGroupRoleRequest) {

        UserGroupRoleRequest userGroupRole = roleService.getUserGroupRoleByExternalID(externalID);
        if (userGroupRole != null) {
            UserGroupRoleRequest updated = roleService.updateUserGroupRole(externalID, userGroupRoleRequest);
            return ResponseEntity.ok(updated);
        }else{
            return ResponseEntity.notFound().build();
        }
    }


    // 刪除使用者權限
    @DeleteMapping("/Delete/UserGroupRole/{externalID}")
    public ResponseEntity<Void> deleteGroupRole(@PathVariable UUID externalID) {
        UserGroupRoleRequest existing = roleService.getUserGroupRoleByExternalID(externalID);
        if (existing != null) {
            roleService.deleteUserGroupRole(externalID);
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
