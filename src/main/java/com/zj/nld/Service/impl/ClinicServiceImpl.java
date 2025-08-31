package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.ClinicDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
import com.zj.nld.Model.Entity.Clinic;
import com.zj.nld.Repository.ClinicRepository;
import com.zj.nld.Service.ClinicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClinicServiceImpl implements ClinicService {

    @Autowired
    private ClinicRepository clinicRepository;


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

}

