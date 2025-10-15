package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.RoleManagerDTO;
import com.zj.nld.Model.Entity.RoleManager;
import com.zj.nld.Repository.RoleManagerRepository;
import com.zj.nld.Service.LineVerificationService;
import com.zj.nld.Service.RoleManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleManagerServiceImpl implements RoleManagerService {

    @Autowired
    private RoleManagerRepository roleManagerRepository;

    @Autowired
    private LineVerificationService lineVerificationService;

    @Value("${app.lineIDs}")
    private String lineIDsString;

    // 取得所有RoleManager
    @Override
    public List<RoleManagerDTO> getAllRoleManager() {
        List<RoleManager> roleManagers = roleManagerRepository.findAll();
        return roleManagers.stream()
                .map(RoleManagerDTO::new) // 直接 new DTO
                .collect(Collectors.toList());
    }

    // 根據LineID找到RoleManager
    @Override
    public RoleManagerDTO getRoleManagerByLineID(String lineID) {
        RoleManager roleManager = roleManagerRepository.findRoleManagerByLineID(lineID);
        if (roleManager != null) {
            return new RoleManagerDTO(roleManager);
        }else{
            return null;
        }
    }

    public boolean isRoleManagerByLineID(String lineID) {
        RoleManager roleManager = roleManagerRepository.findRoleManagerByLineID(lineID);
        if(roleManager != null){
            return true;
        }else{
            return false;
        }
    }

    // 新增一筆RoleManager
    @Override
    @Transactional
    public RoleManagerDTO createRoleManager(RoleManagerDTO roleManagerDTO) {
        // 檢查是否已存在
        RoleManager existingManager = roleManagerRepository.findRoleManagerByLineID(roleManagerDTO.getLineID());
        if (existingManager != null) {
            return null;  // 或拋出異常更明確
        }

        // 建立新的 Entity
        RoleManager newRoleManager = new RoleManager();
        newRoleManager.setLineID(roleManagerDTO.getLineID());
        newRoleManager.setLineName(roleManagerDTO.getLineName());

        // 儲存到資料庫
        RoleManager savedManager = roleManagerRepository.save(newRoleManager);

        // 回傳儲存後的資料（更保險）
        return new RoleManagerDTO(savedManager.getLineID(), savedManager.getLineName());
    }

    // 根據LineID刪除一筆RoleManager
    @Override
    @Transactional
    public boolean deleteRoleManagerByLineID(String lineID) {
        RoleManager roleManager = roleManagerRepository.findRoleManagerByLineID(lineID);
        if(roleManager != null){
            roleManagerRepository.deleteRoleManagerByLineID(lineID);
            return true;
        }else{
            return false;
        }
    }


    /**
     * 驗證使用者是否為超級管理員
     * 透過 Authorization Header 中的 Access Token 驗證
     */
    @Override
    public boolean getRoleManagerByauthHeader(String authHeader) {
        // 1. 從 Header 提取 Access Token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String accessToken = authHeader.substring(7);

        // 2. 透過 LINE API 驗證 Token 並取得真實的 User ID
        String lineID = lineVerificationService.verifyAccessTokenAndGetUserId(accessToken);

        if (isLineIDAllowed(lineID)) {
            return true;
        }else{
            return false;
        }
    }


    // 判斷某個 lineID 是否在逗號分隔的字串裡
    private boolean isLineIDAllowed(String lineID) {
        return Arrays.stream(lineIDsString.split(",")) // 以逗號切割
                .map(String::trim)               // 去掉前後空格
                .anyMatch(id -> id.equals(lineID));
    }
}
