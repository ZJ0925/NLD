package com.zj.nld.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;
import java.util.Date;

public class FormRequest {

    @NotNull
    private String hospital;

    @NotNull
    private String doctor;

    @NotNull
    private String patient;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    @JsonProperty("nextvisit") // 如果前端欄位是 "nextVisit"
    private LocalDate nextvisit;


    private Date createDate;

    private Date lastmodifiedDate;


    public String getHospital() {
        return hospital;
    }

    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    public String getDoctor() {
        return doctor;
    }

    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    public String getPatient() {
        return patient;
    }

    public void setPatient(String patient) {
        this.patient = patient;
    }

    public LocalDate  getNextvisit() {
        return nextvisit;
    }

    public void setNextvisit(LocalDate  nextvisit) {
        this.nextvisit = nextvisit;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Date getLastmodifiedDate() {
        return lastmodifiedDate;
    }

    public void setLastmodifiedDate(Date lastmodifiedDate) {
        this.lastmodifiedDate = lastmodifiedDate;
    }
}
