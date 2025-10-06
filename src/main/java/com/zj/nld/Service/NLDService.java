package com.zj.nld.Service;

import com.zj.nld.Model.DTO.NldDTO;
import com.zj.nld.Model.DTO.NLDProdUnitDTO;
import com.zj.nld.Model.DTO.NldClientDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;

import java.util.List;

public interface NLDService {

    List<?> getWorkOrdersByAccessToken(String authHeader, String roleType, String groupId);


    // 業務搜尋篩選
    List<NldSalesDTO> searchSalesWorkOrders(
            String authHeader,
            String groupId,
            String keyword,
            String dateType,
            String startDate,
            String endDate
    );

}
