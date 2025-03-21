package com.zj.nld.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "form")
public class Form {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "form_id")
    private Integer formId;

    @Column(name = "hospital")
    private String hospital;

    @Column(name = "doctor")
    private String doctor;

    @Column(name = "patient")
    private String patient;

    @Column(name = "next_visit_date")
    private Date nextvisit;

    @Column(name = "created_date")
    @CreationTimestamp//自動建立時間(建立表單當下)
    private Date createdDate;

    @Column(name = "last_modified_date")
    @CreationTimestamp//自動建立時間(建立表單當下)
    private Date lastmodifiedDate;

    public Integer getFormId() {
        return formId;
    }

    public void setFormId(Integer formId) {
        this.formId = formId;
    }

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

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public Date getLastmodifiedDate() {
        return lastmodifiedDate;
    }

    public void setLastmodifiedDate(Date lastmodifiedDate) {
        this.lastmodifiedDate = lastmodifiedDate;
    }
}
