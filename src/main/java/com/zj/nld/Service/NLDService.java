package com.zj.nld.Service;

import com.zj.nld.Model.DTO.NLDDTO;
import com.zj.nld.Model.DTO.NLDProdUnitDTO;
import com.zj.nld.Model.DTO.NldClientDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;

import java.util.List;

public interface NLDService {

    //取得所有NLD
    List<NLDDTO> AdminSearch();

    //取得客戶NLD
    List<NldClientDTO> getNLDByClient(String client);

    //取得業務NLD
    List<NldSalesDTO> getNLDBySales();

     //取得生產單位NLD
    List<NLDProdUnitDTO> getNLDByProdUnit();

    List<?> getNLDByToken(String token);

}
