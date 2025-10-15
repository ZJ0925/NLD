package com.zj.nld.Service;

import com.zj.nld.Model.DTO.RoleManagerDTO;
import com.zj.nld.Model.Entity.RoleManager;

import java.util.List;

public interface RoleManagerService {

    // 取得所有RoleManager
    List<RoleManagerDTO> getAllRoleManager();

    // 根據LineID取得特定 RoleManager
    RoleManagerDTO getRoleManagerByLineID(String lineID);

    // 根據lineID來判斷有沒有RoleManager
    boolean isRoleManagerByLineID(String lineID);

    // 新增一筆RoleManager
    RoleManagerDTO createRoleManager(RoleManagerDTO roleManagerDTO);

    // 刪除一筆RoleManager
    boolean deleteRoleManagerByLineID(String lineID);

    boolean getRoleManagerByauthHeader(String authHeader);


}
