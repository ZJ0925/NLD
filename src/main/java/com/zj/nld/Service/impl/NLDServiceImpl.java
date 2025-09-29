package com.zj.nld.Service.impl;

import com.zj.nld.Model.DTO.NldDTO;
import com.zj.nld.Model.DTO.NLDProdUnitDTO;
import com.zj.nld.Model.Entity.Clinic;
import com.zj.nld.Model.Entity.UserGroupRole;
import com.zj.nld.Repository.NLDRepository;
import com.zj.nld.Model.DTO.NldClientDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;
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
    private UserGroupRoleService userGroupRoleService;

    @Autowired
    private PersonService clinicService;

    @Autowired
    private DoctorService doctorService;


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
                    yield nldRepository.ClientForDocSearch(userGroupRole.getGroupNameID(), userGroupRole.getUserNameID());
                }
                // 業務
                case 3 -> nldRepository.SalesSearch(userGroupRole.getUserNameID());
                // 生產單位
                case 4 -> nldRepository.ProdUnitSearch();
                // 牙助單位
                case 5 ->{
                    Clinic clinic = clinicService.findByClinicName(userGroupRole.getGroupName());
                    yield nldRepository.ClientSearch(clinic.getClinicAbbr());
                }


                default -> null;
            };
        }
        throw new RuntimeException("驗證失敗");
    }
}