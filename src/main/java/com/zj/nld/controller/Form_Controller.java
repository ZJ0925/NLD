package com.zj.nld.controller;

import com.zj.nld.DataTransferObject.FormRequest;
import com.zj.nld.model.Form;
import com.zj.nld.service.FormService;
import jakarta.persistence.criteria.From;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/form")
@CrossOrigin(origins = "http://localhost:63342")/// 這裡到時候需要刪掉
public class Form_Controller {

    @Autowired
    private FormService formService;


    @GetMapping("/{formId}")
    public ResponseEntity<Form> getFormById(@PathVariable Integer formId) {
        Form form = formService.getFormById(formId);
        if (form != null) {
            return ResponseEntity.ok(form);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
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
}