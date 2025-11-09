package com.zj.nld.Repository;

import com.zj.nld.Model.DTO.GroupDTO;
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

    @Query("SELECT DISTINCT new com.zj.nld.Model.DTO.GroupDTO(u.groupID, u.groupName) FROM UserGroupRole u")
    List<GroupDTO> findDistinctGroups();




    // 根據groupID找到該群組的userGroupRole
    @Query("SELECT u FROM UserGroupRole u WHERE u.groupID = :groupID")
    List<UserGroupRole> findUserGroupRolesByGroupID(@Param("groupID") String groupID);

    // 根據externalID找到該筆權限
    UserGroupRole findUserGroupRoleByExternalID(UUID externalID);

    // 根據LINE ID和GroupID找到權限資料
    UserGroupRole findByLineIDAndGroupID(String lineID, String groupID);

    // 根據LINE ID找到權限資料
    UserGroupRole findByLineID(String lineID);

    // 找出某個 groupID 的所有 UserGroupRole
    List<UserGroupRole> findByGroupID(String groupID);


    @Query("""
        SELECT ugr.groupName
        FROM UserGroupRole ugr
        WHERE ugr.groupID = :groupID
        GROUP BY ugr.groupName
        ORDER BY COUNT(ugr.groupName) DESC
    """)
    String findTopGroupNameByGroupID(@Param("groupID") String groupID);

    // 直接用 JPA 更新 groupName---------------(紫色的GroupName、GroupNameID、GroupID要大寫)
    @Modifying
    // 佈署時註解
//    @Query(value = "UPDATE UserGroupRole SET groupName = :groupName, groupNameID = :groupNameID WHERE groupID = :groupID", nativeQuery = true)
    // 開發時註解
    @Query(value = "UPDATE UserGroupRole SET GroupName = :groupName, GroupNameID = :groupNameID WHERE GroupID = :groupID", nativeQuery = true)
    void updateGroupNameAndIDByGroupIDNative(@Param("groupID") String groupID,
                                            @Param("groupName") String groupName,
                                            @Param("groupNameID") String groupNameID);

    // 用externalID刪除使用者權限 (by externalID)
    @Modifying
    @Query("DELETE FROM UserGroupRole u WHERE u.externalID = :externalID")
    void deleteUserGroupRoleByExternalID(@Param("externalID") UUID externalID);

    // 用lineID與groupID刪除使用者權限 (by lineID and groupID)
    @Modifying
    @Query("DELETE FROM UserGroupRole u WHERE u.lineID = :lineID AND u.groupID = :groupID")
    void deleteUserGroupRoleByLineIDAndGroupID(@Param("lineID") String lineID, @Param("groupID") String groupID);

    // 刪除群組的所有權限 (by groupID)
    @Modifying
    @Query("DELETE FROM UserGroupRole u WHERE u.groupID = :groupID")
    void deleteUserGroupRoleByGroupID(@Param("groupID") String groupID);

}