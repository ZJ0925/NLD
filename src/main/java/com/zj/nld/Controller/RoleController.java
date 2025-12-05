package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.GroupDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Service.RoleService;
import com.zj.nld.Service.LineService;  // ✅ 新增
import com.zj.nld.Service.UserGroupRoleService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/Role")
public class RoleController {

    @Autowired
    private RoleService roleService;

    private static final Logger log = LoggerFactory.getLogger(RoleController.class);
    @Autowired
    private UserGroupRoleService userGroupRoleService;

    @Autowired
    private LineService lineService;


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

    /**
     * 同步群組成員資料
     * @param groupID LINE 群組 ID
     * @return 同步結果
     */
    @PostMapping("/sync/GroupMembers")
    public ResponseEntity<Map<String, Object>> syncGroupMembers(
            @RequestParam String groupID) {

        log.info("📥 開始同步群組成員，groupID: {}", groupID);

        try {
            // 呼叫 LineService 的同步方法
            Map<String, Object> result = lineService.syncGroupMembers(groupID);

            if ((Boolean) result.get("success")) {
                log.info("✅ 群組成員同步成功: {}", result);
                return ResponseEntity.ok(result);
            } else {
                log.warn("⚠️ 群組成員同步失敗: {}", result.get("message"));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }

        } catch (Exception e) {
            log.error("❌ 同步群組成員時發生錯誤: {}", e.getMessage(), e);

            Map<String, Object> errorResult = Map.of(
                    "success", false,
                    "message", "同步失敗: " + e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
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



    /**
     * 驗證使用者是否為超級管理員
     * 前端透過此 API 驗證權限
     */
    @PostMapping("/userLogin")
    public ResponseEntity<Boolean> getUser(
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            boolean response = userGroupRoleService.findRoleManagerByauthHeader(authHeader);

            if (response) {
                // 驗證通過，返回管理員資訊
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


}