package com.zj.nld.Repository.JpaRepository;

import com.zj.nld.Model.doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<doctor, String> {
    doctor findByDoctorId(String doctorId);
}
