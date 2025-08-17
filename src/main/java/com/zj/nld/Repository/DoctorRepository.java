package com.zj.nld.Repository;

import com.zj.nld.Model.Entity.GroupRole;
import com.zj.nld.Model.Entity.doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<doctor, String> {
    doctor findByDoctorName(String doctorName);
}


