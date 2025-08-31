package com.zj.nld.Model.DTO;

import com.zj.nld.Model.Entity.Clinic;
import jakarta.persistence.Column;
import jakarta.persistence.Id;

// 診所DTO
public class ClinicDTO {

    private String clinicId;


    private String  clinicName;


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

    public ClinicDTO(Clinic clinic) {
        this.clinicId = clinic.getClinicId();
        this.clinicName = clinic.getClinicName();
        this.clinicAbbr = clinic.getClinicAbbr();
    }




}
