package com.zj.nld.service.impl;

import com.zj.nld.DataTransferObject.FormRequest;
import com.zj.nld.dao.JpaRepository.FormRepository;
import com.zj.nld.model.Form;
import com.zj.nld.service.FormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;


@Service
@Component
public class FormServiceImpl implements FormService {

    @Autowired
    private  FormRepository formRepository;

    // 根據表單 ID 查詢表單
    public Form getFormById(Integer formId) {
        return formRepository.findByFormId(formId);
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
}
