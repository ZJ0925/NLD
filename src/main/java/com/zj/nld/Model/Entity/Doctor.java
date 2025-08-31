package com.zj.nld.Model.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import javax.sql.rowset.spi.SyncResolver;

//醫生Table
@Entity
@Table(name = "DOCTOR")
public class Doctor {

    @Id
    @Column(name = "NUM_D")
    private String doctorId;

    @Column(name = "NAM_D")
    private String doctorName;

    @Column(name = "CNO_D")
    private String clinicId;

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getClinicId() {
        return clinicId;
    }

    public void setClinicId(String clinicId) {
        this.clinicId = clinicId;
    }
}
