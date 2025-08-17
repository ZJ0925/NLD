package com.zj.nld.Controller;


import com.zj.nld.Model.DTO.GroupRoleRequest;
import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Service.NLDService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/Admin")
public class AdminController {

    @Autowired
    private NLDService nldService;

    @GetMapping("token/{type}/{token}")
    public List<GroupRole> getAdmin(@PathVariable String type, @PathVariable String token){
        return nldService.getAdminByToken(token);
    }
}
