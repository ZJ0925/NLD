package com.zj.nld.Controller;


import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.DTO.UserGroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Service.NLDService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/Admin")
public class AdminController {

    @Autowired
    private NLDService nldService;

    @GetMapping("token/{type}/{token}")
    public List<GroupRoleRequest> getAdmin(@PathVariable String type, @PathVariable String token){
        List<GroupRole> groupRoles = nldService.getAdminByToken(token);
        return groupRoles.stream()
                .map(GroupRoleRequest::new)
                .collect(Collectors.toList());
    }
}
