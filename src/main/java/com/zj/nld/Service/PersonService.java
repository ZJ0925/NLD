package com.zj.nld.Service;

import com.zj.nld.Model.DTO.ClinicDTO;
import com.zj.nld.Model.DTO.DoctorDTO;
import com.zj.nld.Model.DTO.SalesDTO;
import com.zj.nld.Model.Entity.Clinic;

import java.util.List;

public interface PersonService {

    // 找到所有診所
    List<ClinicDTO> findAllClinic();

    Clinic findByClinicName(String clinicName);

    // 找到所有業務
    List<SalesDTO> findAllSales();

    // 找到所有醫生
    List<DoctorDTO> findAllDoctors();

}
