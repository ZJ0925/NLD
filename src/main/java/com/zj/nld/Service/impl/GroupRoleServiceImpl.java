package com.zj.nld.Service.impl;

import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Repository.GroupRoleRepository;
import com.zj.nld.Service.GroupRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GroupRoleServiceImpl implements GroupRoleService {

    @Autowired
    private GroupRoleRepository groupRoleRepository;


    @Override
    public GroupRole findGroupRoleByGroupID(String groupID){
        return groupRoleRepository.findGroupRoleByGroupID(groupID);
    }

}
