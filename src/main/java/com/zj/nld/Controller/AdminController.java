package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Service.NLDService;
import com.zj.nld.Service.UserGroupRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/Admin")
public class AdminController {

    @Autowired
    private NLDService nldService;

    @Autowired
    private UserGroupRoleService userGroupRoleService;

    @GetMapping("token/{type}/{token}")
    public List<UserGroupRoleRequest> getAdmin(@PathVariable String type, @PathVariable String token){
        List<UserGroupRole> groupRoles = userGroupRoleService.getAdminByToken(token);
        return groupRoles.stream()
                .map(UserGroupRoleRequest::new)
                .collect(Collectors.toList());
    }

    @PutMapping("update")
    public List<UserGroupRoleRequest> updateGroupRole(@RequestBody List<UserGroupRoleRequest> groupRolesDTO){
        List<UserGroupRole> updatedRoles = userGroupRoleService.updateGroupRoles(groupRolesDTO);

        return updatedRoles.stream()
                .map(UserGroupRoleRequest::new)
                .collect(Collectors.toList());
    }
}