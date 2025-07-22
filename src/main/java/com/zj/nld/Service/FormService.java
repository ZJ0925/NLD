package com.zj.nld.Service;

import com.zj.nld.DTO.FormRequest;
import com.zj.nld.Model.Form;


public interface FormService {

    Form getFormById(Integer formId);
    Integer submitForm(FormRequest formRequest);
    void updateForm(Integer formId,FormRequest formRequest);
    Form findForm(String hospital, String doctor, String patient);

}
