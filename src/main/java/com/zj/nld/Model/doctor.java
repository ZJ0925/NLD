package com.zj.nld.Model;


import jakarta.persistence.*;

@Entity
@Table(name = "doctor")
public class doctor {

    @Id
    @Column(name = "NUM")
    private String doctorId;

    @Column(name = "NAM_4")
    private String  doctorName;

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
}
