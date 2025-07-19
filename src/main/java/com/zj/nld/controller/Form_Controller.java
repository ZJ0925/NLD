package com.zj.nld.controller;

import com.zj.nld.dto.FormRequest;
import com.zj.nld.model.Form;
import com.zj.nld.service.FormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/form")
@CrossOrigin(origins = "http://localhost:63342")/// 這裡到時候需要刪掉
public class Form_Controller {
    //網頁控制提交、更新、(刪除)功能



    @Autowired
    private FormService formService;


    //透過formId找form
    @GetMapping("/{formId}")
    public ResponseEntity<Form> getFormById(@PathVariable Integer formId) {
        Form form = formService.getFormById(formId);
        if (form != null) {
            return ResponseEntity.ok(form);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

    }

    //透過醫院、醫師、病患找form
    @GetMapping("/getform")
    public ResponseEntity<Form> getForm(@RequestParam String hospital,
                                            @RequestParam String doctor,
                                            @RequestParam String patient) {
        Form form = formService.findForm(hospital, doctor, patient);
        if(form == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }else{
            return ResponseEntity.status(HttpStatus.OK).body(form);
        }
    }


    // 接收表單數據並保存到資料庫
    @PostMapping("/submit")
    public ResponseEntity<Form> submitForm(@RequestBody @Validated FormRequest formRequest) {
        // 儲存表單數據
        Integer formId = formService.submitForm(formRequest);
        Form form = formService.getFormById(formId);
        return ResponseEntity.status(HttpStatus.CREATED).body(form);
    }
    @PutMapping("/update/{formId}")
    public ResponseEntity<Form> updateForm(@PathVariable Integer formId, @RequestBody @Validated FormRequest formRequest) {
        Form form = formService.getFormById(formId);
        if (form == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        formService.updateForm(formId,formRequest);
        Form updatedForm = formService.getFormById(formId);
        return ResponseEntity.status(HttpStatus.OK).body(updatedForm);
    }


}