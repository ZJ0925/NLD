package com.zj.nld.Service;

import com.zj.nld.Model.DTO.*;

import java.util.List;

public interface NLDService {

    /**
     * 根據 Access Token 取得使用者角色資訊
     */
    UserGroupRoleDTO getUserRoleByAccessToken(String authHeader, String groupIdFromClient);


    List<?> getWorkOrdersByAccessToken(String authHeader, String roleType, String groupId);

    List<?> getWorkOrderDetailByNum(String authHeader, String groupId, String workOrderNum);

    boolean updateWorkOrderRemarks(String authHeader, String groupId, String workOrderNum, String remarks);

    // 業務搜尋篩選
    List<?> searchAdminWorkOrders(
            String authHeader,
            String groupId,
            String keyword,
            String dateType,
            String startDate,
            String saleName
    );

    // 業務搜尋篩選
    List<?> searchTypeWorkOrders(
            String authHeader,
            String groupId,
            String keyword,
            String dateType,
            String startDate
    );

    // ✅ 新增：取得業務列表
    List<?> getSalesList(String authHeader, String groupId);

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
