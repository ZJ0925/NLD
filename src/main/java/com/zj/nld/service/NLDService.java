package com.zj.nld.service;

import com.zj.nld.model.NLD;

import java.util.List;
import java.util.UUID;

public interface NLDService {
    NLD getNLDByExternalID(UUID externalID);
    List<NLD> getAllNLD();
}
