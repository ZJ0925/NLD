package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.*;
import com.zj.nld.Model.Entity.Clinic;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.NLDRepository;
import com.zj.nld.Service.*;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Service
@Component
public class NLDServiceImpl implements NLDService {

    @Autowired
    private NLDRepository nldRepository;

    @Autowired
    private UserGroupRoleService userGroupRoleService;

    @Autowired
    private PersonService clinicService;

    @Autowired
    private LineVerificationService lineVerificationService;

    private String getRoleNameById(Integer roleId) {
        return switch (roleId) {
            case 1 -> "Admin";
            case 2 -> "Doc";
            case 3 -> "Sales";
            case 4 -> "ProdUnit";
            case 5 -> "Assistant";
            default -> "Unknown";
        };
    }

    private Pageable top500 = PageRequest.of(0, 500);


    /**
     * 根據 Access Token 取得使用者角色資訊
     */
    @Transactional(readOnly = true)
    public UserGroupRoleDTO getUserRoleByAccessToken(String authHeader, String groupIdFromClient) {

        // 1. 驗證 Authorization Header 格式
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid Authorization Header");
        }

        String accessToken = authHeader.substring(7);

        // 2. 呼叫 LINE API 驗證 Access Token 並取得真實的 LINE User ID
        String lineId = lineVerificationService.verifyAccessTokenAndGetUserId(accessToken);

        if (lineId == null || lineId.trim().isEmpty()) {
            throw new SecurityException("無效的 Access Token");
        }

        // 3. 驗證必須有 Group ID
        if (groupIdFromClient == null || groupIdFromClient.trim().isEmpty()) {
            throw new IllegalArgumentException("必須從群組開啟 LIFF，缺少 Group ID");
        }

        // 4. 用 LineID + GroupID 查詢使用者角色
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupIdFromClient);

        if (userGroupRole == null) {
            throw new RuntimeException("使用者不存在或未授權此群組");
        }

        // 5. 直接用建構子轉換成 DTO
        return new UserGroupRoleDTO(userGroupRole);
    }



    // 根據 Access Token 和角色類型取得工單
    @Transactional(readOnly = true)
    @Override
    public List<?> getWorkOrdersByAccessToken(String authHeader, String roleType, String groupId) {
        // 1. 驗證 Authorization Header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid Authorization Header");
        }

        String accessToken = authHeader.substring(7);

        // 2. 驗證 Access Token 並取得 LINE ID
        String lineId = lineVerificationService.verifyAccessTokenAndGetUserId(accessToken);

        if (lineId == null || lineId.trim().isEmpty()) {
            throw new SecurityException("無效的 Access Token");
        }

        // 3. 驗證 Group ID
        if (groupId == null || groupId.trim().isEmpty()) {
            throw new IllegalArgumentException("缺少 Group ID");
        }

        // 4. 查詢使用者群組角色
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupId);

        if (userGroupRole == null) {
            throw new RuntimeException("使用者不存在或未授權此群組");
        }

        // 5. 驗證角色是否匹配（建議保留）
        String userRole = getRoleNameById(userGroupRole.getRoleID());
        if (!roleType.equalsIgnoreCase(userRole)) {
            throw new RuntimeException("角色不匹配，期望: " + roleType + "，實際: " + userRole);
        }

        // 6. 根據角色取得工單
        return switch (userGroupRole.getRoleID()) {
            case 1 -> nldRepository.AdminSearch(top500);
            case 2 -> nldRepository.DocSearch(
                    userGroupRole.getGroupNameID(),
                    userGroupRole.getUserNameID(),top500
            );
            case 3 -> nldRepository.SalesSearch(userGroupRole.getUserNameID(), top500);
            case 4 -> nldRepository.ProdUnitSearch(top500);
            case 5 -> nldRepository.AssistantSearch(userGroupRole.getGroupNameID(), top500);
            default -> Collections.emptyList();  // 改這裡：回傳空 List 而非 null
        };
    }

    // 業務搜尋篩選
    @Transactional(readOnly = true)
    @Override
    public List<?> searchTypeWorkOrders(
            String authHeader,
            String groupId,
            String keyword,
            String dateType,
            String startDate,
            String endDate
    ) {
        // 1. 驗證 Token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid Authorization Header");
        }

        String accessToken = authHeader.substring(7);
        String lineId = lineVerificationService.verifyAccessTokenAndGetUserId(accessToken);

        if (lineId == null || lineId.trim().isEmpty()) {
            throw new SecurityException("無效的 Access Token");
        }

        // 2. 驗證 Group ID
        if (groupId == null || groupId.trim().isEmpty()) {
            throw new IllegalArgumentException("缺少 Group ID");
        }

        // 3. 查詢使用者角色
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupId);

        if (userGroupRole == null) {
            throw new RuntimeException("使用者不存在或未授權此群組");
        }

        // 5. 轉換日期格式
        Date parsedStartDate = null;
        Date parsedEndDate = null;

        if (startDate != null && !startDate.trim().isEmpty()) {
            try {
                parsedStartDate = new SimpleDateFormat("yyyy-MM-dd").parse(startDate);
            } catch (ParseException e) {
                throw new IllegalArgumentException("起始日期格式錯誤");
            }
        }

        if (endDate != null && !endDate.trim().isEmpty()) {
            try {
                parsedEndDate = new SimpleDateFormat("yyyy-MM-dd").parse(endDate);
            } catch (ParseException e) {
                throw new IllegalArgumentException("結束日期格式錯誤");
            }
        }


        // 6. 根據角色取得工單
        return switch (userGroupRole.getRoleID()) {
            case 1 -> nldRepository.AdminSearchWithFilters(keyword, dateType, parsedStartDate, parsedEndDate);
            case 2 -> nldRepository.DocWithFilters(
                    userGroupRole.getGroupNameID(),
                    userGroupRole.getUserNameID(),
                    keyword,
                    dateType,
                    parsedStartDate,
                    parsedEndDate
            );
            case 3 -> nldRepository.SalesSearchWithFilters(
                    userGroupRole.getUserNameID(),
                    keyword,
                    dateType,
                    parsedStartDate,
                    parsedEndDate
             );
            case 4 -> nldRepository.ProdUnitSearchWithFilters(
                    keyword,
                    dateType,
                    parsedStartDate,
                    parsedEndDate
            );
            case 5 -> nldRepository.AssistantSearchWithFilters(
                    userGroupRole.getGroupNameID(),
                    keyword,
                    dateType,
                    parsedStartDate,
                    parsedEndDate
            );

            default -> Collections.emptyList();  // 改這裡：回傳空 List 而非 null
        };
    }

    // 業務搜尋篩選
//    @Transactional(readOnly = true)
//    @Override
//    public List<NldSalesDTO> searchSalesWorkOrders(
//            String authHeader,
//            String groupId,
//            String keyword,
//            String dateType,
//            String startDate,
//            String endDate
//    ) {
//        // 1. 驗證 Token
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            throw new IllegalArgumentException("Invalid Authorization Header");
//        }
//
//        String accessToken = authHeader.substring(7);
//        String lineId = lineVerificationService.verifyAccessTokenAndGetUserId(accessToken);
//
//        if (lineId == null || lineId.trim().isEmpty()) {
//            throw new SecurityException("無效的 Access Token");
//        }
//
//        // 2. 驗證 Group ID
//        if (groupId == null || groupId.trim().isEmpty()) {
//            throw new IllegalArgumentException("缺少 Group ID");
//        }
//
//        // 3. 查詢使用者角色
//        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupId);
//
//        if (userGroupRole == null) {
//            throw new RuntimeException("使用者不存在或未授權此群組");
//        }
//
//        // 4. 確認是 Sales 角色
//        if (userGroupRole.getRoleID() != 3) {
//            throw new RuntimeException("此功能僅限 Sales 角色使用");
//        }
//
//        // 5. 轉換日期格式
//        Date parsedStartDate = null;
//        Date parsedEndDate = null;
//
//        if (startDate != null && !startDate.trim().isEmpty()) {
//            try {
//                parsedStartDate = new SimpleDateFormat("yyyy-MM-dd").parse(startDate);
//            } catch (ParseException e) {
//                throw new IllegalArgumentException("起始日期格式錯誤");
//            }
//        }
//
//        if (endDate != null && !endDate.trim().isEmpty()) {
//            try {
//                parsedEndDate = new SimpleDateFormat("yyyy-MM-dd").parse(endDate);
//            } catch (ParseException e) {
//                throw new IllegalArgumentException("結束日期格式錯誤");
//            }
//        }
//
//        // 6. 呼叫 Repository 搜尋
//        return nldRepository.SalesSearchWithFilters(
//                userGroupRole.getUserNameID(),
//                keyword,
//                dateType,
//                parsedStartDate,
//                parsedEndDate
//        );
//    }

//    // 牙助搜尋篩選
//    @Transactional(readOnly = true)
//    @Override
//    public List<NldClientDTO> searchAssistantWorkOrders(String authHeader, String groupId, String keyword, String dateType, String startDate, String endDate) {
//        return List.of();
//    }
//
//    // 醫生搜尋篩選
//    @Transactional(readOnly = true)
//    @Override
//    public List<NldClientDTO> searchDocWorkOrders(String authHeader, String groupId, String keyword, String dateType, String startDate, String endDate) {
//        return List.of();
//    }
//
//    // 生產單位搜尋篩選
//    @Transactional(readOnly = true)
//    @Override
//    public List<NLDProdUnitDTO> searchProdUnitWorkOrders(String authHeader, String groupId, String keyword, String dateType, String startDate, String endDate) {
//        return List.of();
//    }
//
//    // 管理員搜尋篩選
//    @Transactional(readOnly = true)
//    @Override
//    public List<NldDTO> searchAdminWorkOrders(String authHeader, String groupId, String keyword, String dateType, String startDate, String endDate) {
//        return List.of();
//    }
}