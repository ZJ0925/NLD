package com.zj.nld.Repository;

import com.zj.nld.Model.Entity.RoleManager;
import org.hibernate.sql.Delete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoleManagerRepository extends JpaRepository<RoleManager, String> {

    List<RoleManager> findAll();

    RoleManager findRoleManagerByLineID(@Param("lineID") String lineID);

    void deleteRoleManagerByLineID(@Param("lineID") String lineID);


}
