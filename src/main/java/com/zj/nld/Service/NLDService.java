package com.zj.nld.Service;

import com.zj.nld.Model.DTO.NLDProdUnitRequest;
import com.zj.nld.Model.DTO.NLDRequest;
import com.zj.nld.Model.DTO.NldClientRequest;
import com.zj.nld.Model.DTO.NldSalesRequest;
import com.zj.nld.Model.Entity.GroupRole;

import java.util.List;

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

    List<GroupRole> getAdminByToken(String token);
}
