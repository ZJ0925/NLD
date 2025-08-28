package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.NLDRequest;
import com.zj.nld.Model.Entity.Doctor;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.UserGroupRoleRepository;
import com.zj.nld.Repository.NLDRepository;
import com.zj.nld.Model.DTO.NLDProdUnitRequest;
import com.zj.nld.Model.DTO.NldClientRequest;
import com.zj.nld.Model.DTO.NldSalesRequest;
import com.zj.nld.Service.*;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Component
public class NLDServiceImpl implements NLDService {

    @Autowired
    private NLDRepository nldRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    UserGroupRoleService userGroupRoleService;

    @Autowired
    DoctorService doctorService;

    @Autowired
    private UserGroupRoleRepository userGroupRoleRepository;

    @Override
    public List<NLDRequest> AdminSearch() {
        return nldRepository.AdminSearch();
    }

    //客戶可取得的資料
    @Override
    public List<NldClientRequest> getNLDByClient(String client) {
        return nldRepository.ClientSearch(client);
    }
    //業務可取得的資料
    @Override
    public List<NldSalesRequest> getNLDBySales() {
        return nldRepository.SalesSearch();
    }

    //生產單位可取得的資料
    @Override
    public List<NLDProdUnitRequest> getNLDByProdUnit() {
        return nldRepository.ProdUnitSearch();
    }

    @Override
    public List<?> getNLDByToken(String token) {
        jwtService.isTokenValid(token);
        Claims claims = jwtService.parseToken(token);
        //從token讀取lineId
        String lineId = claims.get("lineId", String.class);
        //從token讀取groupId
        String groupId = claims.get("groupId", String.class);

        //從token讀取roleId
        int roleId = claims.get("roleId", Integer.class);


        // 找到該user所在的group可使用的權限
        UserGroupRole userGroupRole = userGroupRoleService.getRoleId(lineId, groupId);

        if (((groupId == null) && (userGroupRole.getRoleID() == roleId)) ||
                (groupId != null && (userGroupRole.getRoleID() == roleId)))
        {
            return switch (roleId) {
                // 管理者
                case 1 -> nldRepository.AdminSearch();
                // 客戶(需做診所篩選)
                case 2 -> {
                    Doctor doctor = doctorService.findByDoctorName(userGroupRole.getGroupName());
                    yield nldRepository.ClientForDocSearch(doctor.getDocName(), userGroupRole.getUserName());
                }
                // 業務
                case 3 -> nldRepository.SalesSearch();
                // 生產單位
                case 4 -> nldRepository.ProdUnitSearch();
                default -> null;
            };
        }
        throw new RuntimeException("驗證失敗");
    }
}