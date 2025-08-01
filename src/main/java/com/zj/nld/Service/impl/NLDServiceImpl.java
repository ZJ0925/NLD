package com.zj.nld.Service.impl;

import com.zj.nld.Model.GroupRole;
import com.zj.nld.Model.UserGroupRole;
import com.zj.nld.Repository.JpaRepository.NLDRepository;
import com.zj.nld.DTO.NLDProdUnitRequest;
import com.zj.nld.DTO.NldClientRequest;
import com.zj.nld.DTO.NldSalesRequest;
import com.zj.nld.Model.NLD;
import com.zj.nld.Service.JwtService;
import com.zj.nld.Service.NLDService;
import com.zj.nld.Service.PermissionService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Component
public class NLDServiceImpl implements NLDService {

    @Autowired
    private NLDRepository nldRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PermissionService permissionService;

    @Override
    public NLD getNLDByExternalID(UUID externalID) {
        NLD nld = nldRepository.findByExternalID(externalID);
        return nld;
    }

    @Override
    public List<NLD> getAllNLD() {
        return nldRepository.findAll();
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

        // 找到Group可以使用的權限
        GroupRole groupRole = permissionService.getGroupRoleByGroupID(groupId);

        // 找到該user所在的group可使用的權限
        UserGroupRole userGroupRole = permissionService.getRoleId(lineId, groupId);



        if (((groupId == null) && (userGroupRole.getRoleID() == roleId)) ||
            ((groupRole.getRoleID() == userGroupRole.getRoleID()) &&
            (userGroupRole.getRoleID() == roleId) &&
            (groupRole.getRoleID() == roleId)))
        {
            return switch (roleId) {
                // 管理者
                case 1 -> nldRepository.findAll();
                // 客戶(需做診所篩選)
                case 2 -> {
                    if(groupId == null)
                    {
                        yield nldRepository.ClientForDocSearch(groupRole.getGroupName(), userGroupRole.getUserName());

                    }else {
                        yield nldRepository.ClientSearch(groupRole.getGroupName());
                    }
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
