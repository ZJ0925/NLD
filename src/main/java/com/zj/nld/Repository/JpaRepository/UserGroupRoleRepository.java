package com.zj.nld.Repository.JpaRepository;


import com.zj.nld.Model.UserGroupRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;


public interface UserGroupRoleRepository extends JpaRepository<UserGroupRole, UUID> {

    //根據LINE ID和GrouppID找到權限資料
    UserGroupRole findByLineIDAndGroupID(String lineID, String groupID);

    //根據LINE ID找到權限資料
    UserGroupRole findByLineID(String lineID);

}
