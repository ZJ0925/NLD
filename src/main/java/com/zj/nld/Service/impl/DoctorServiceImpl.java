package com.zj.nld.Service.impl;

import com.zj.nld.Model.Entity.Doctor;
import com.zj.nld.Repository.DoctorRepository;
import com.zj.nld.Service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public Doctor getDoctorByName(String doctorName) {
        return doctorRepository.findByDoctorName(doctorName);
    }
}
