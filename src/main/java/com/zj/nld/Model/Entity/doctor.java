package com.zj.nld.Model.Entity;


import jakarta.persistence.*;

@Entity
@Table(name = "doctor")
public class doctor {

    @Id
    @Column(name = "NUM")
    private String doctorId;

    @Column(name = "NAM_2")
    private String  doctorName;


    @Column(name = "NAM_4")
    private String  docName;


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


    public String getDocName() {
        return docName;
    }

    public void setDocName(String docName) {
        this.docName = docName;
    }
}
