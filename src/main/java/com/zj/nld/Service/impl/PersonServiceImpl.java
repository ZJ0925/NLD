package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.ClinicDTO;
import com.zj.nld.Model.DTO.DoctorDTO;
import com.zj.nld.Model.DTO.SalesDTO;
import com.zj.nld.Model.Entity.Clinic;
import com.zj.nld.Model.Entity.Doctor;
import com.zj.nld.Model.Entity.Sales;
import com.zj.nld.Repository.ClinicRepository;
import com.zj.nld.Repository.DoctorRepository;
import com.zj.nld.Repository.SalesRepository;
import com.zj.nld.Service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PersonServiceImpl implements PersonService {

    @Autowired
    private ClinicRepository clinicRepository;

    @Autowired
    private SalesRepository salesRepository;

    @Autowired
    private DoctorRepository doctorRepository;


    // 找到所有診所
    @Override
    public List<ClinicDTO> findAllClinic() {

        List<Clinic> clinics = clinicRepository.findAll();
        // 建構子轉換 Entity → DTO
        return clinics.stream()
                .map(ClinicDTO::new)
                .collect(Collectors.toList());

    }

    @Override
    public Clinic findByClinicName(String clinicName) {
        return clinicRepository.findByClinicName(clinicName);
    }


    // 找到所有業務
    @Override
    public List<SalesDTO> findAllSales() {

        List<Sales> saless = salesRepository.findAll();
        // 建構子轉換 Entity → DTO
        return saless.stream()
                .map(SalesDTO::new)
                .collect(Collectors.toList());

    }

    // 找到所有醫生
    @Override
    public List<DoctorDTO> findAllDoctors() {

        List<Doctor> doctor = doctorRepository.findAll();
        // 建構子轉換 Entity → DTO
        return doctor.stream()
                .map(DoctorDTO::new)
                .collect(Collectors.toList());

    }

}

