package com.zj.nld.Service;

import com.zj.nld.Model.DTO.NldDTO;
import com.zj.nld.Model.DTO.NLDProdUnitDTO;
import com.zj.nld.Model.DTO.NldClientDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;

import java.util.List;

public interface NLDService {

    //取得所有NLD
    List<NldDTO> AdminSearch();

    //取得客戶NLD
    List<NldClientDTO> getNLDByClient(String client);

    //取得業務NLD
    List<NldSalesDTO> getNLDBySales(String userNameID);

     //取得生產單位NLD
    List<NLDProdUnitDTO> getNLDByProdUnit();

    List<?> getNLDByUser(String groupId, String lineId);
    List<?> getWorkOrdersByAccessToken(String authHeader, String roleType, String groupId);

}
