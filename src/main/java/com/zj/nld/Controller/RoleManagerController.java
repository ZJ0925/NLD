package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.RoleManagerDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
import com.zj.nld.Service.RoleManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/RoleManager")
public class RoleManagerController {

    @Autowired
    private RoleManagerService roleManagerService;

    // 取得所有RoleManager
    @GetMapping("/getAll")
    public ResponseEntity<List<RoleManagerDTO>> getAllRoleManager() {
        List<RoleManagerDTO> roleManagerDTOList = roleManagerService.getAllRoleManager();
        if(!roleManagerDTOList.isEmpty()){
            return ResponseEntity.ok(roleManagerDTOList);
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // 根據LineID取得特定 RoleManager
    @GetMapping("/{lineID}")
    public ResponseEntity<RoleManagerDTO> getRoleManagerByLineID(@PathVariable String lineID) {
        RoleManagerDTO roleManagerDTO = roleManagerService.getRoleManagerByLineID(lineID);
        if(roleManagerDTO != null){
            return ResponseEntity.ok(roleManagerDTO);
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // 新增一筆RoleManager
    @PostMapping("/created")
    public ResponseEntity<RoleManagerDTO> createRoleManager(@RequestBody RoleManagerDTO roleManagerDTO) {
        RoleManagerDTO newRoleManagerDTO = roleManagerService.createRoleManager(roleManagerDTO);
        if(newRoleManagerDTO != null){
            return ResponseEntity.status(HttpStatus.CREATED).body(newRoleManagerDTO);
        }else{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 刪除一筆RoleManager
    @DeleteMapping("/{lineID}")
    public ResponseEntity<Void> deleteRoleManagerByLineID(@PathVariable  String lineID) {
        boolean delete = roleManagerService.deleteRoleManagerByLineID(lineID);
        if (delete) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }else{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 驗證使用者是否為超級管理員
     * 前端透過此 API 驗證權限
     */
    @PostMapping("/admin")
    public ResponseEntity<Boolean> getAdmin(
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            boolean response = roleManagerService.getRoleManagerByauthHeader(authHeader);

            if (response) {
                // 驗證通過，返回管理員資訊
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
