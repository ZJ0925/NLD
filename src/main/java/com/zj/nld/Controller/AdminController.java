package com.zj.nld.Controller;


import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Service.GroupRoleService;
import com.zj.nld.Service.NLDService;
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
    private GroupRoleService groupRoleService;

    @GetMapping("token/{type}/{token}")
    public List<GroupRoleRequest> getAdmin(@PathVariable String type, @PathVariable String token){
        List<GroupRole> groupRoles = groupRoleService.getAdminByToken(token);
        return groupRoles.stream()
                .map(GroupRoleRequest::new)
                .collect(Collectors.toList());
    }

    public List<GroupRoleRequest> updateGroupRole(@PathVariable String type, @PathVariable String token, List<GroupRoleRequest> groupRolesDTO){
        List<GroupRole> updatedRoles = groupRoleService.updateGroupRolesByToken(token, groupRolesDTO);

        return updatedRoles.stream()
                .map(GroupRoleRequest::new)
                .collect(Collectors.toList());
    }

}
