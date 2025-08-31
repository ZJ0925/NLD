package com.zj.nld.Model.DTO;

import com.zj.nld.Model.Entity.Clinic;
import jakarta.persistence.Column;
import jakarta.persistence.Id;

// 診所DTO
public class ClinicDTO {

    private String clinicId;


    private String  clinicName;


    private String clinicAbbr;

    public ClinicDTO(Clinic clinic) {
    }

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

    public ClinicDTO(String clinicId, String clinicName, String clinicAbbr) {
        this.clinicId = clinicId;
        this.clinicName = clinicName;
        this.clinicAbbr = clinicAbbr;
    }

    public ClinicDTO() {}


}
