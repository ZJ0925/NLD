package com.zj.nld.Service;

import com.zj.nld.Model.Entity.Doctor;

public interface DoctorService {

    Doctor findByDoctorName(String doctorName);
}
