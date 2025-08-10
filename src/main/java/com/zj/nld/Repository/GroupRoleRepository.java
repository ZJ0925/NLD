package com.zj.nld.Repository;

import com.zj.nld.Model.Entity.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupRoleRepository extends JpaRepository<GroupRole, String> {

    // getAll
    List<GroupRole> findAll();

    // 根據groupID找到群組該筆群組權限
    GroupRole findGroupRoleByGroupID(String groupID);

    // 刪除群組權限
    void deleteGroupRoleByGroupID(String groupID);







}
