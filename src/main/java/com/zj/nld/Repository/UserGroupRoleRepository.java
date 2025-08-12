package com.zj.nld.Repository;


import com.zj.nld.Model.Entity.UserGroupRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;


public interface UserGroupRoleRepository extends JpaRepository<UserGroupRole, UUID> {


    // getAll
    List<UserGroupRole> findAll();

    // 根據groupID找到群組該筆群組權限
    UserGroupRole findUserGroupRoleByExternalID(UUID externalID);

    // 刪除使用者權限
    void deleteUserGroupRoleByExternalID(UUID externalID);

    // 刪除使用者權限
    void deleteUserGroupRoleByLineIDAndGroupID(String lineID, String groupID);

    //根據LINE ID和GrouppID找到權限資料
    UserGroupRole findByLineIDAndGroupID(String lineID, String groupID);

    //根據LINE ID找到權限資料
    UserGroupRole findByLineID(String lineID);


}
