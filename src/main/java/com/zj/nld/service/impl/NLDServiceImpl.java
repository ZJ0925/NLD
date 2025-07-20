package com.zj.nld.service.impl;

import com.zj.nld.dao.JpaRepository.NLDRepository;
import com.zj.nld.dto.NLDProdUntiRequest;
import com.zj.nld.dto.NldClientRequest;
import com.zj.nld.dto.NldSalesRequest;
import com.zj.nld.model.NLD;
import com.zj.nld.service.NLDService;
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
    public List<NldClientRequest> getNLDByClient() {
        return nldRepository.ClientSearch();
    }
    //業務可取得的資料
    @Override
    public List<NldSalesRequest> getNLDBySales() {
        return nldRepository.SalesSearch();
    }

    //生產單位可取得的資料
    @Override
    public List<NLDProdUntiRequest> getNLDByProdUnti() {
        return nldRepository.ProdUntiSearch();
    }

    //根據權限回傳可取得的資料
    @Override
    public List<?> getNLDByRole(String role) {
        switch (role) {
            case "Client":
                return nldRepository.ClientSearch();
            case "Sales":
                return nldRepository.SalesSearch();
            case "ProdUnti":
                return nldRepository.ProdUntiSearch();
            default:
                return null;
        }
    }
}
