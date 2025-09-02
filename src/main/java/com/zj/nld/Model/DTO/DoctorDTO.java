package com.zj.nld.Model.DTO;


import com.zj.nld.Model.Entity.Doctor;

// 醫生DTO
public class DoctorDTO {


    private String doctorId;

    private String doctorName;

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

    public DoctorDTO(Doctor doctor) {
        this.doctorId = getDoctorId();
        this.doctorName = getDoctorName();
    }
}
