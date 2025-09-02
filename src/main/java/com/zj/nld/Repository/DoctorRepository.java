package com.zj.nld.Repository;

import com.zj.nld.Model.Entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

    List<Doctor> findAll();

    Doctor findByDoctorName(String doctorName);
}
