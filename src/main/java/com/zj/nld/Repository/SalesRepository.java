package com.zj.nld.Repository;

import com.zj.nld.Model.Entity.Clinic;
import com.zj.nld.Model.Entity.Sales;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalesRepository extends JpaRepository<Sales, String> {

    List<Sales> findAll();


}


