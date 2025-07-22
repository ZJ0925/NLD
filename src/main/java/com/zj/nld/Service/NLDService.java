package com.zj.nld.Service;

import com.zj.nld.DTO.NLDProdUntiRequest;
import com.zj.nld.DTO.NldClientRequest;
import com.zj.nld.DTO.NldSalesRequest;
import com.zj.nld.Model.NLD;

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
