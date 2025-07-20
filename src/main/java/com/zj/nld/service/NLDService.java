package com.zj.nld.service;

import com.zj.nld.dto.NLDProdUntiRequest;
import com.zj.nld.dto.NldClientRequest;
import com.zj.nld.dto.NldSalesRequest;
import com.zj.nld.model.NLD;

import java.util.List;
import java.util.UUID;

public interface NLDService {
    NLD getNLDByExternalID(UUID externalID);
    List<NLD> getAllNLD();
    List<NldClientRequest> getNLDByClient();
    List<NldSalesRequest> getNLDBySales();
    List<NLDProdUntiRequest> getNLDByProdUnti();
    List<?> getNLDByRole(String role);
}
