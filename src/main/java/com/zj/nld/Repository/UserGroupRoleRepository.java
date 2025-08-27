package com.zj.nld.Repository;

import com.zj.nld.Model.Entity.UserGroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserGroupRoleRepository extends JpaRepository<UserGroupRole, UUID> {

    // getAll
    List<UserGroupRole> findAll();

    // 根據externalID找到該筆權限
    UserGroupRole findUserGroupRoleByExternalID(UUID externalID);

    // 根據groupID找到權限 (用於群組層級的操作)
    UserGroupRole findUserGroupRoleByGroupID(String groupID);

    // 根據groupID找到該群組的所有權限
    List<UserGroupRole> findByGroupID(String groupID);

    // 根據多個groupID查找
    List<UserGroupRole> findByGroupIDIn(List<String> groupIds);

    // 刪除使用者權限 (by externalID)
    @Modifying
    @Query("DELETE FROM UserGroupRole u WHERE u.externalID = :externalID")
    void deleteUserGroupRoleByExternalID(@Param("externalID") UUID externalID);

    // 刪除使用者權限 (by lineID and groupID)
    @Modifying
    @Query("DELETE FROM UserGroupRole u WHERE u.lineID = :lineID AND u.groupID = :groupID")
    void deleteUserGroupRoleByLineIDAndGroupID(@Param("lineID") String lineID, @Param("groupID") String groupID);

    // 刪除群組的所有權限 (by groupID)
    @Modifying
    @Query("DELETE FROM UserGroupRole u WHERE u.groupID = :groupID")
    void deleteUserGroupRoleByGroupID(@Param("groupID") String groupID);

    // 根據LINE ID和GroupID找到權限資料
    UserGroupRole findByLineIDAndGroupID(String lineID, String groupID);

    // 根據LINE ID找到權限資料
    UserGroupRole findByLineID(String lineID);
}