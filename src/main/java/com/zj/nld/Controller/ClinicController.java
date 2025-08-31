package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.ClinicDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
import com.zj.nld.Service.ClinicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/Clinic")
public class ClinicController {

    private ClinicService clinicService;

    // 取得該群組的所有使用者權限
    @GetMapping("/GET/AllClinic")
    public ResponseEntity<List<ClinicDTO>> getAllClinic() {
        List<ClinicDTO> clinics = clinicService.findAllClinic();

        if (clinics != null && !clinics.isEmpty()) {
            return ResponseEntity.ok(clinics);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
