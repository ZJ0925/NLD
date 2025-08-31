package com.zj.nld.Service;

import com.zj.nld.Model.DTO.ClinicDTO;
import com.zj.nld.Model.Entity.Clinic;

import java.util.List;

public interface ClinicService {

    List<ClinicDTO> findAllClinic();

    Clinic findByClinicName(String clinicName);
}
