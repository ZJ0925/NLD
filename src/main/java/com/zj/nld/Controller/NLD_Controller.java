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

    @GetMapping("/{externalID}")
    public ResponseEntity<NLD> getNLDByExternal(@PathVariable UUID externalID){
        NLD nld = nldService.getNLDByExternalID(externalID);
        if (nld != null)
        {
            return ResponseEntity.ok(nld);
        }else{
            return ResponseEntity.status(404).body(null);
        }
    }

    // 取得全部NLD
    @GetMapping("/getAll")
    public ResponseEntity <List<NLD>> getAllNLD(){
        List<NLD> nldList = nldService.getAllNLD();
        if(!nldList.isEmpty()){
            return ResponseEntity.ok(nldList);
        }else{
            return ResponseEntity.status(404).body(null);
        }
    }

    // 根據權限取得NLD
    @GetMapping("token/{type}/{token}")
    public ResponseEntity<?> getNLDByToken(@PathVariable String type,@PathVariable String token){
        return ResponseEntity.ok(nldService.getNLDByToken(token));
    }
}
