package com.zj.nld.Service.impl;

import com.zj.nld.DTO.FormRequest;
import com.zj.nld.Repository.JpaRepository.FormRepository;
import com.zj.nld.Model.Form;
import com.zj.nld.Service.FormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.Date;


@Service
@Component
public class FormServiceImpl implements FormService {

    @Autowired
    private  FormRepository formRepository;

    // 根據表單 ID 查詢表單
    public Form getFormById(Integer formId) {
        return formRepository.findByFormId(formId);
    }


    @Override
    public Form findForm(String hospital, String doctor, String patient) {
        return formRepository.findByHospitalAndDoctorAndPatient(hospital, doctor, patient);
    }

    // 保存新的表單
    public Integer submitForm(FormRequest formRequest) {
        //建立新的form物件
        Form form = new Form();
        //將formRequest物件設定為新的form物件
        form.setHospital(formRequest.getHospital());
        form.setDoctor(formRequest.getDoctor());
        form.setPatient(formRequest.getPatient());
        form.setNextvisit(formRequest.getNextvisit());
        // 把表單數據存儲到資料庫
        formRepository.save(form);
        //return剛建立好表單的Id
        return form.getFormId();
    }

    //更新表單
    @Override
    public void updateForm(Integer formId, FormRequest formRequest) {
        //找到該ID的form
        Form form = formRepository.findByFormId(formId);
        //將formRequest物件設定為新的form物件
        form.setHospital(formRequest.getHospital());
        form.setDoctor(formRequest.getDoctor());
        form.setPatient(formRequest.getPatient());
        form.setNextvisit(formRequest.getNextvisit());
        form.setLastmodifiedDate(new Date());
        // 把表單數據存儲到資料庫
        formRepository.save(form);
    }
}
