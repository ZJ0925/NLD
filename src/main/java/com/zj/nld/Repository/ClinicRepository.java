package com.zj.nld.Repository;

import com.zj.nld.Model.Entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicRepository extends JpaRepository<Clinic, String> {

    List<Clinic> findAll();

    Clinic findByClinicName(String clinicName);

}


