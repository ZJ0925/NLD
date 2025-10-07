package com.zj.nld.Service;

import com.zj.nld.Model.DTO.NldDTO;
import com.zj.nld.Model.DTO.NLDProdUnitDTO;
import com.zj.nld.Model.DTO.NldClientDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;

import java.util.List;

public interface NLDService {

    List<?> getWorkOrdersByAccessToken(String authHeader, String roleType, String groupId);


    // 業務搜尋篩選
    List<?> searchTypeWorkOrders(
            String authHeader,
            String groupId,
            String keyword,
            String dateType,
            String startDate,
            String endDate
    );

//
//    // 牙助搜尋篩選
//    List<?> searchAssistantWorkOrders(
//            String authHeader,
//            String groupId,
//            String keyword,
//            String dateType,
//            String startDate,
//            String endDate
//    );
//
//
//    // 醫生搜尋篩選
//    List<NldClientDTO> searchDocWorkOrders(
//            String authHeader,
//            String groupId,
//            String keyword,
//            String dateType,
//            String startDate,
//            String endDate
//    );
//
//
//    // 生產單位搜尋篩選
//    List<NLDProdUnitDTO> searchProdUnitWorkOrders(
//            String authHeader,
//            String groupId,
//            String keyword,
//            String dateType,
//            String startDate,
//            String endDate
//    );
//
//
//    // 業務搜尋篩選
//    List<NldDTO> searchAdminWorkOrders(
//            String authHeader,
//            String groupId,
//            String keyword,
//            String dateType,
//            String startDate,
//            String endDate
//    );

}
