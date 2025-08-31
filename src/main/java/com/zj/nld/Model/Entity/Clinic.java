package com.zj.nld.Model.Entity;


import jakarta.persistence.*;


//診所Entity
@Entity
@Table(name = "CUS")
public class Clinic {

    @Id
    @Column(name = "NUM")
    private String clinicId;

    @Column(name = "NAM_2")
    private String  clinicName;

    @Column(name = "NAM_4")
    private String clinicAbbr;


    public String getClinicId() {
        return clinicId;
    }

    public void setClinicId(String clinicId) {
        this.clinicId = clinicId;
    }

    public String getClinicName() {
        return clinicName;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public String getClinicAbbr() {
        return clinicAbbr;
    }

    public void setClinicAbbr(String clinicAbbr) {
        this.clinicAbbr = clinicAbbr;
    }

}
