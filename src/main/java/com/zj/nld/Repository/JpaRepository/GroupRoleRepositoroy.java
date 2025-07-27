package com.zj.nld.Repository.JpaRepository;

import com.zj.nld.Model.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRoleRepositoroy extends JpaRepository<GroupRole, String> {

    GroupRole findGroupRoleByGroupID(String groupID);
}
