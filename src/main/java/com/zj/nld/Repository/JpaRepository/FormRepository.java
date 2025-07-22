package com.zj.nld.Repository.JpaRepository;

import com.zj.nld.DTO.FormRequest;
import com.zj.nld.Model.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

@Repository
@Component
public interface FormRepository extends JpaRepository<Form, Integer> {

    Form findByFormId(Integer formId);
    Integer save(FormRequest formRequest);
    Form findByHospitalAndDoctorAndPatient(String hospital, String doctor, String patient);
}
