package com.zj.nld.service.impl;

import com.zj.nld.dao.JpaRepository.NLDRepository;
import com.zj.nld.model.NLD;
import com.zj.nld.service.NLDService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Component
public class NLDServiceImpl implements NLDService {

    @Autowired
    private NLDRepository nldRepository;

    @Override
    public NLD getNLDByExternalID(UUID externalID) {
        NLD nld = nldRepository.findByExternalID(externalID);
        return nld;
    }

    @Override
    public List<NLD> getAllNLD() {
        return nldRepository.findAll();
    }
}
