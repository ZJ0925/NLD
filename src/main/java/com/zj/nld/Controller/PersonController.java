package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.ClinicDTO;
import com.zj.nld.Model.DTO.DoctorDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;
import com.zj.nld.Model.DTO.SalesDTO;
import com.zj.nld.Service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/Person")
public class PersonController {

    @Autowired
    private PersonService personService;

    // 取得診所API
    @GetMapping("/GET/Clinic")
    public ResponseEntity<List<ClinicDTO>> getAllClinic() {
        List<ClinicDTO> clinics = personService.findAllClinic();

        if (clinics != null && !clinics.isEmpty()) {
            return ResponseEntity.ok(clinics);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 取得診所API
    @GetMapping("/GET/Sales")
    public ResponseEntity<List<SalesDTO>> getAllSales() {
        List<SalesDTO> sales = personService.findAllSales();

        if (sales != null && !sales.isEmpty()) {
            return ResponseEntity.ok(sales);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 取得診所API
    @GetMapping("/GET/Doctor")
    public ResponseEntity<List<DoctorDTO>> getAllDoctor() {
        List<DoctorDTO> doctors = personService.findAllDoctors();

        if (doctors != null && !doctors.isEmpty()) {
            return ResponseEntity.ok(doctors);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
