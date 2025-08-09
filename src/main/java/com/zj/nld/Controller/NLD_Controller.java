package com.zj.nld.Controller;

import com.zj.nld.Model.NLD;
import com.zj.nld.Service.JwtService;
import com.zj.nld.Service.NLDService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/NLD")
public class NLD_Controller {

    @Autowired
    private NLDService nldService;

    @Autowired
    private JwtService jwtService;

    // 根據權限取得NLD
    @GetMapping("token/{type}/{token}")
    public ResponseEntity<?> getNLDByToken(@PathVariable String type,@PathVariable String token){
        return ResponseEntity.ok(nldService.getNLDByToken(token));
    }
}
