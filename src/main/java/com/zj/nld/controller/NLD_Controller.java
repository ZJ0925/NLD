package com.zj.nld.controller;

import com.zj.nld.model.NLD;
import com.zj.nld.service.FormService;
import com.zj.nld.service.NLDService;
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

    @GetMapping("/getAll")
    public ResponseEntity <List<NLD>> getAllNLD(){
        List<NLD> nldList = nldService.getAllNLD();
        if(!nldList.isEmpty()){
            return ResponseEntity.ok(nldList);
        }else{
            return ResponseEntity.status(404).body(null);
        }
    }
}
