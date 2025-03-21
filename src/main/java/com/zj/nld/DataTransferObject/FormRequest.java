package com.zj.nld.DataTransferObject;

import jakarta.persistence.Column;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.Date;

public class FormRequest {

    @NotNull
    private String hospital;

    @NotNull
    private String doctor;

    @NotNull
    private String patient;

    @NotNull
    private Date nextvisit;


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

    public Date getNextvisit() {
        return nextvisit;
    }

    public void setNextvisit(Date nextvisit) {
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
