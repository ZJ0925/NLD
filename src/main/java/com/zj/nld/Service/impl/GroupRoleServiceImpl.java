package com.zj.nld.Service.impl;

import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Repository.GroupRoleRepository;
import com.zj.nld.Service.GroupRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroupRoleServiceImpl implements GroupRoleService {

    @Autowired
    private GroupRoleRepository groupRoleRepository;


    @Override
    public GroupRole findGroupRoleByGroupID(String groupID){
        return groupRoleRepository.findGroupRoleByGroupID(groupID);
    }



    // 新增群組
    @Override
    public GroupRole createGroupRole(GroupRole groupRole){
        return groupRoleRepository.save(groupRole);
    }

    // 更新群組名稱
    @Override
    public boolean updateGroupRole(GroupRole groupRole){
        try {
            groupRoleRepository.save(groupRole);
            return true;
        }catch (Exception e){
            return false;
        }
    }


    //刪除群組
    @Override
    @Transactional
    public void deleteGroupRoleByGroupID(String groupID){
        groupRoleRepository.deleteGroupRoleByGroupID(groupID);
    }

    // 在GroupRole根據groupID取得對應的權限ID
    @Override
    public GroupRole getGroupRoleByGroupID(String groupID) {
        GroupRole groupRole = groupRoleRepository.findGroupRoleByGroupID(groupID);
        if (groupRole != null) {
            return groupRole;
        }else{
            return null;
        }
    }

}
