package com.zj.nld.Repository;

import com.zj.nld.Model.Entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

    Doctor findByDoctorName(String doctorName);
}
