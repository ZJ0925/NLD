package com.zj.nld.Controller;

import com.zj.nld.Model.DTO.NldSalesDTO;
import com.zj.nld.Model.DTO.UserGroupRoleDTO;
import com.zj.nld.Service.NLDService;
import com.zj.nld.Service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/sales/search")
    public ResponseEntity<?> searchSalesWorkOrders(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestParam(required = false) String groupId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dateType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        try {
            List<NldSalesDTO> results = nldService.searchSalesWorkOrders(
                    authHeader,
                    groupId,
                    keyword,
                    dateType,
                    startDate,
                    endDate
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
}