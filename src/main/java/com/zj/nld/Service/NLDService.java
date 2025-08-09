package com.zj.nld.Service;

import com.zj.nld.DTO.NLDProdUnitRequest;
import com.zj.nld.DTO.NLDRequest;
import com.zj.nld.DTO.NldClientRequest;
import com.zj.nld.DTO.NldSalesRequest;
import com.zj.nld.Model.NLD;
import io.jsonwebtoken.Claims;

import java.util.List;
import java.util.UUID;

public interface NLDService {

    //取得所有NLD
    List<NLDRequest> AdminSearch();

    //取得客戶NLD
    List<NldClientRequest> getNLDByClient(String client);

    //取得業務NLD
    List<NldSalesRequest> getNLDBySales();

     //取得生產單位NLD
    List<NLDProdUnitRequest> getNLDByProdUnit();

    List<?> getNLDByToken(String token);
}
