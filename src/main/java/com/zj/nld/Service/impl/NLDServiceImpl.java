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
                    userGroupRole.getUserNameID(),   // docID - 只傳醫生ID
                    top500
            );
            case 3 -> nldRepository.SalesSearch(userGroupRole.getUserNameID(), top500);
            case 4 -> nldRepository.AdminSearch(top500);
            case 5 -> nldRepository.AssistantSearch(userGroupRole.getGroupNameID(), top500);
            default -> Collections.emptyList();
        };
    }


    @Transactional(readOnly = true)
    @Override
    public List<?> searchTypeWorkOrders(
            String authHeader,
            String groupId,
            String keyword,
            String dateType,
            String startDate
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
        //Date parsedEndDate = null;

        if (startDate != null && !startDate.trim().isEmpty()) {
            try {
                parsedStartDate = new SimpleDateFormat("yyyy-MM-dd").parse(startDate);
            } catch (ParseException e) {
                throw new IllegalArgumentException("起始日期格式錯誤");
            }
        }

        // 6. 根據角色取得工單
        return switch (userGroupRole.getRoleID()) {
            case 1 -> nldRepository.AdminSearchWithFilters(keyword, dateType, parsedStartDate, null);
            case 2 -> nldRepository.DocWithFilters(
                    userGroupRole.getUserNameID(),   // docID - 只傳醫生ID
                    keyword,
                    dateType,
                    parsedStartDate
            );
            case 3 -> nldRepository.SalesSearchWithFilters(
                    userGroupRole.getUserNameID(),
                    keyword,
                    dateType,
                    parsedStartDate
            );
            case 4 -> nldRepository.ProdUnitSearchWithFilters(
                    keyword,
                    dateType,
                    parsedStartDate
            );
            case 5 -> nldRepository.AssistantSearchWithFilters(
                    userGroupRole.getGroupNameID(),
                    keyword,
                    dateType,
                    parsedStartDate
            );

            default -> Collections.emptyList();
        };
    }

    /**
     * 取得業務列表（僅限管理員）
     */
    @Transactional(readOnly = true)
    @Override
    public List<?> getSalesList(String authHeader, String groupId) {
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

        // 4. 驗證是否為管理員
        if (userGroupRole.getRoleID() != 1) {
            throw new RuntimeException("無權限：僅限管理員使用此功能");
        }

        // 5. 查詢業務列表
        return nldRepository.getSalesList();
    }

    /**
     * 根據工單號查詢詳細資料（包含所有相關的 VED 資料）
     */
    @Transactional(readOnly = true)
    @Override
    public List<?> getWorkOrderDetailByNum(String authHeader, String groupId, String workOrderNum) {
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

        // 3. 驗證工單號
        if (workOrderNum == null || workOrderNum.trim().isEmpty()) {
            throw new IllegalArgumentException("缺少工單號");
        }

        // 4. 查詢使用者角色
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupId);

        if (userGroupRole == null) {
            throw new RuntimeException("使用者不存在或未授權此群組");
        }

        // 5. 根據角色和工單號查詢完整數據
        return switch (userGroupRole.getRoleID()) {
            case 1 -> nldRepository.AdminGetDetailByWorkOrderNum(workOrderNum);
            case 2 -> nldRepository.DocGetDetailByWorkOrderNum(
                    userGroupRole.getUserNameID(),   // docID - 只傳醫生ID
                    workOrderNum
            );
            case 3 -> nldRepository.SalesGetDetailByWorkOrderNum(
                    userGroupRole.getUserNameID(),
                    workOrderNum
            );
            case 4 -> nldRepository.ProdUnitGetDetailByWorkOrderNum(workOrderNum);
            case 5 -> nldRepository.AssistantGetDetailByWorkOrderNum(
                    userGroupRole.getGroupNameID(),
                    workOrderNum
            );
            default -> Collections.emptyList();
        };
    }

    @Transactional
    @Override
    public boolean updateWorkOrderRemarks(String authHeader, String groupId, String workOrderNum, String remarks) {
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


        // 5. 更新備註 - 直接調用 Repository 的 @Modifying 方法，返回更新的行數
        int updatedRows = nldRepository.updateWorkOrderRemarks(workOrderNum, remarks);

        return updatedRows > 0;
    }


    @Transactional(readOnly = true)
    @Override
    public List<?> searchAdminWorkOrders(
            String authHeader,
            String groupId,
            String keyword,
            String dateType,
            String startDate,
            String salesName
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
        //Date parsedEndDate = null;

        if (startDate != null && !startDate.trim().isEmpty()) {
            try {
                parsedStartDate = new SimpleDateFormat("yyyy-MM-dd").parse(startDate);
            } catch (ParseException e) {
                throw new IllegalArgumentException("起始日期格式錯誤");
            }
        }

        // 6. 根據角色取得工單
        return switch (userGroupRole.getRoleID()) {
            case 1 -> nldRepository.AdminSearchWithFilters(keyword, dateType, parsedStartDate, salesName);
            case 2 -> nldRepository.DocWithFilters(
                    userGroupRole.getUserNameID(),  // ✅ 只傳 docID
                    keyword,
                    dateType,
                    parsedStartDate
            );
            case 3 -> nldRepository.SalesSearchWithFilters(
                    userGroupRole.getUserNameID(),
                    keyword,
                    dateType,
                    parsedStartDate
            );
            case 4 -> nldRepository.ProdUnitSearchWithFilters(
                    keyword,
                    dateType,
                    parsedStartDate
            );
            case 5 -> nldRepository.AssistantSearchWithFilters(
                    userGroupRole.getGroupNameID(),
                    keyword,
                    dateType,
                    parsedStartDate
            );

            default -> Collections.emptyList();
        };
    }


}