package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.*;
import com.zj.nld.Model.Entity.Clinic;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.NLDRepository;
import com.zj.nld.Service.*;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
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

    @Autowired
    private RoleService roleService;


    @Override
    public List<NldDTO> AdminSearch() {
        return nldRepository.AdminSearch();
    }

    //客戶可取得的資料
    @Override
    public List<NldClientDTO> getNLDByClient(String client) {
        return nldRepository.ClientSearch(client);
    }


    //業務可取得的資料
    @Override
    public List<NldSalesDTO> getNLDBySales(String userNameID) {
        return nldRepository.SalesSearch(userNameID);
    }

    //生產單位可取得的資料
    @Override
    public List<NLDProdUnitDTO> getNLDByProdUnit() {
        return nldRepository.ProdUnitSearch();
    }

    @Override
    public List<?> getNLDByUser(String groupId, String lineId) {

        // 找到該user所在的group可使用的權限
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupId);


            return switch (userGroupRole.getRoleID()) {
                // 管理者
                case 1 -> nldRepository.AdminSearch();
                // 客戶(需做診所篩選)
                case 2 -> {
                    yield nldRepository.ClientForDocSearch(userGroupRole.getGroupNameID(), userGroupRole.getUserNameID());
                }
                // 業務
                case 3 -> nldRepository.SalesSearch(userGroupRole.getUserNameID());
                // 生產單位
                case 4 -> nldRepository.ProdUnitSearch();
                // 牙助單位
                case 5 -> {
                    Clinic clinic = clinicService.findByClinicName(userGroupRole.getGroupName());
                    yield nldRepository.ClientSearch(clinic.getClinicAbbr());
                }
                default -> null;
            };
    };


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
            case 1 -> nldRepository.AdminSearch();
            case 2 -> nldRepository.ClientForDocSearch(
                    userGroupRole.getGroupNameID(),
                    userGroupRole.getUserNameID()
            );
            case 3 -> nldRepository.SalesSearch(userGroupRole.getUserNameID());
            case 4 -> nldRepository.ProdUnitSearch();
            case 5 -> {
                Clinic clinic = clinicService.findByClinicName(userGroupRole.getGroupName());
                yield nldRepository.ClientSearch(clinic.getClinicAbbr());
            }
            default -> Collections.emptyList();  // 改這裡：回傳空 List 而非 null
        };
    }

    private String getRoleNameById(Integer roleId) {
        return switch (roleId) {
            case 1 -> "Admin";
            case 2 -> "Client";
            case 3 -> "Sales";
            case 4 -> "ProdUnit";
            case 5 -> "Assistant";
            default -> "Unknown";
        };
    }
}