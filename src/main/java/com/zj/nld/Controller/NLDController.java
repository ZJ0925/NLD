package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.*;
import com.zj.nld.Service.NLDService;
import com.zj.nld.Service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/NLD")
public class NLDController {

    @Autowired
    private NLDService nldService;

    @Autowired
    private RoleService roleService;

    @PostMapping("/user/role")
    public ResponseEntity<?> getUserRole(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestBody(required = false) Map<String, String> requestBody) {

        try {
            String groupId = (requestBody != null) ? requestBody.get("groupId") : null;
            UserGroupRoleDTO response = roleService.getUserRoleByAccessToken(authHeader, groupId);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    @PostMapping("/{roleType}/workOrders")
    public ResponseEntity<?> getWorkOrdersByRole(
            @PathVariable String roleType,
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestBody(required = false) Map<String, String> requestBody) {

        try {
            String groupId = (requestBody != null) ? requestBody.get("groupId") : null;
            List<?> workOrders = nldService.getWorkOrdersByAccessToken(authHeader, roleType, groupId);
            return ResponseEntity.ok(workOrders);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }


    // 業務搜尋篩選
    @GetMapping("/Sales/search")
    public ResponseEntity<?> searchSalesWorkOrders(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestParam(required = false) String groupId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dateType,
            @RequestParam(required = false) String startDate
    ) {
        try {
            List<?> results = nldService.searchTypeWorkOrders(
                    authHeader,
                    groupId,
                    keyword,
                    dateType,
                    startDate
            );

            return ResponseEntity.ok(results);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    // 牙助搜尋篩選
    @GetMapping("/Assistant/search")
    public ResponseEntity<?> searchAssistantWorkOrders(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestParam(required = false) String groupId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dateType,
            @RequestParam(required = false) String startDate
    ) {
        try {
            List<?> results = nldService.searchTypeWorkOrders(
                    authHeader,
                    groupId,
                    keyword,
                    dateType,
                    startDate
            );

            return ResponseEntity.ok(results);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    // 醫生搜尋篩選
    @GetMapping("/Doc/search")
    public ResponseEntity<?> searchDocWorkOrders(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestParam(required = false) String groupId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dateType,
            @RequestParam(required = false) String startDate

    ) {
        try {
            List<?> results = nldService.searchTypeWorkOrders(
                    authHeader,
                    groupId,
                    keyword,
                    dateType,
                    startDate
            );

            return ResponseEntity.ok(results);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    // 生產單位搜尋篩選
    @GetMapping("/ProdUnit/search")
    public ResponseEntity<?> searchProdUnitWorkOrders(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestParam(required = false) String groupId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dateType,
            @RequestParam(required = false) String startDate
    ) {
        try {
            List<?> results = nldService.searchTypeWorkOrders(
                    authHeader,
                    groupId,
                    keyword,
                    dateType,
                    startDate
            );

            return ResponseEntity.ok(results);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    // 取得業務列表
    @GetMapping("/Admin/salesList")
    public ResponseEntity<?> getSalesList(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestParam(required = false) String groupId
    ) {
        try {
            List<?> salesList = nldService.getSalesList(authHeader, groupId);
            return ResponseEntity.ok(salesList);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    // 管理者搜尋篩選
    @GetMapping("/Admin/search")
    public ResponseEntity<?> searchAdminWorkOrders(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestParam(required = false) String groupId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dateType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String salesName
    ) {
        try {
            List<?> results = nldService.searchAdminWorkOrders(
                    authHeader,
                    groupId,
                    keyword,
                    dateType,
                    startDate,
                    salesName
            );
            return ResponseEntity.ok(results);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    /**
     * 更新工單備註
     */
    @PutMapping("/Admin/workorder/{workOrderNum}/remarks")
    public ResponseEntity<?> updateWorkOrderRemarks(
            @PathVariable String workOrderNum,
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestBody Map<String, String> requestBody) {

        try {
            String groupId = requestBody.get("groupId");
            String remarks = requestBody.get("remarks");
            System.out.println("groupId:"+groupId);
            System.out.println("remarks:"+remarks);
            if (remarks == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "備註內容不可為空"));
            }

            boolean success = nldService.updateWorkOrderRemarks(
                    authHeader,
                    groupId,
                    workOrderNum,
                    remarks
            );

            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "備註已更新"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "更新失敗"));
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    /**
     * 查詢工單詳細資料（包含所有相關的 VED 資料）
     * 各角色共用端點，根據使用者權限自動返回對應資料
     */
    @GetMapping("/{roleType}/workorder/{workOrderNum}")
    public ResponseEntity<?> getWorkOrderDetail(
            @PathVariable String roleType,
            @PathVariable String workOrderNum,
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestParam(required = false) String groupId
    ) {
        try {
            List<?> result = nldService.getWorkOrderDetailByNum(authHeader, groupId, workOrderNum);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "系統錯誤"));
        }
    }

    /**
     * 取得當前使用者的群組資訊（用於顯示標題）
     */
    @GetMapping("/Doc/userInfo")
    public ResponseEntity<?> getUserInfo(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String groupId
    ) {
        try {
            // 驗證並取得使用者資訊
            UserGroupRoleDTO userInfo = nldService.getUserRoleByAccessToken(authHeader, groupId);

            Map<String, String> response = new HashMap<>();
            response.put("clinicName", userInfo.getGroupName());  // 診所名稱
            response.put("docName", userInfo.getUserName());      // 醫生名稱

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}