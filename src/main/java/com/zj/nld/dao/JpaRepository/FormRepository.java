package com.zj.nld.dao.JpaRepository;

import com.zj.nld.DataTransferObject.FormRequest;
import com.zj.nld.model.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

@Repository
@Component
public interface FormRepository extends JpaRepository<Form, Integer> {

    Form findByFormId(Integer formId);
    Integer save(FormRequest formRequest);
}
