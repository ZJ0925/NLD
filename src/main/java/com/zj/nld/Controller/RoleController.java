package com.zj.nld.Controller;


import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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


}
