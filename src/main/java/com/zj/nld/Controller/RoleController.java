package com.zj.nld.Controller;

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
    public List<UserGroupRoleRequest> getAdmin(){
        List<UserGroupRole> groupRoles = userGroupRoleService.getAllRole();
        return groupRoles.stream()
                .map(UserGroupRoleRequest::new)
                .collect(Collectors.toList());
    }

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
    public ResponseEntity<UserGroupRoleRequest> CreateUserGroupRole(@RequestBody UserGroupRoleRequest userGroupRoleRequest) {
        UserGroupRoleRequest addUserGroupRole = roleService.createUserGroupRole(userGroupRoleRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(addUserGroupRole);
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


    // 刪除使用者權限
    @DeleteMapping("/Delete/UserGroupRole/{externalID}")
    public ResponseEntity<Void> deleteUserGroupRole(@PathVariable UUID externalID) {
        UserGroupRoleRequest existing = roleService.getUserGroupRoleByExternalID(externalID);
        if (existing != null) {
            roleService.deleteUserGroupRole(externalID);
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}