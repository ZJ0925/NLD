package com.zj.nld.service;

import com.zj.nld.DataTransferObject.FormRequest;
import com.zj.nld.model.Form;


public interface FormService {

    Form getFormById(Integer formId);
    Integer submitForm(FormRequest formRequest);
    void updateForm(Integer formId,FormRequest formRequest);

}
