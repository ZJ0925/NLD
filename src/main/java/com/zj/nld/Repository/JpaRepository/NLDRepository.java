package com.zj.nld.Repository.JpaRepository;

import com.zj.nld.DTO.NLDProdUnitRequest;
import com.zj.nld.DTO.NldClientRequest;
import com.zj.nld.DTO.NldSalesRequest;
import com.zj.nld.Model.NLD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@Component
public interface NLDRepository extends JpaRepository<NLD, UUID> {

    //找單筆NLD
    NLD findByExternalID(UUID externalID);

    //回傳業務可查看的資料
    @Query("SELECT new com.zj.nld.DTO.NldSalesRequest(" +
            "n.workOrderNum, n.clinicName, n.docName, " +
            "n.patientName, n.receivedDate, n.deliveryDate, " +
            "n.toothPosition, n.prodItem, n.prodName, " +
            "n.tryInDate, n.estFinishDate, n.workOrderStatus, " +
            "n.estTryInDate, n.price, n.isRemake, n.isNoCharge, " +
            "n.isPaused, n.isVoided, n.tryInReceivedDate, n.remarks) " +
            "FROM NLD n")
    List<NldSalesRequest> SalesSearch();

    //回傳客戶可查看的資料(診所)
    @Query("SELECT new com.zj.nld.DTO.NldClientRequest(" +
            "n.workOrderNum, n.clinicName, n.docName, n.patientName, " +
            "n.deliveryDate, n.toothPosition, n.prodName, " +
            "n.tryInDate, n.workOrderStatus, n.isRemake, " +
            "n.isNoCharge, n.isPaused, n.isVoided, n.remarks) FROM NLD n WHERE n.clinicName = :clientName")
    List<NldClientRequest> ClientSearch(String clientName);

    //回傳客戶可查看的資料(診所)
    @Query("SELECT new com.zj.nld.DTO.NldClientRequest(" +
            "n.workOrderNum, n.clinicName, n.docName, n.patientName, " +
            "n.deliveryDate, n.toothPosition, n.prodName, " +
            "n.tryInDate, n.workOrderStatus, n.isRemake, " +
            "n.isNoCharge, n.isPaused, n.isVoided, n.remarks) FROM NLD n WHERE n.clinicName = :clientName AND n.docName = :docName")
    List<NldClientRequest> ClientForDocSearch(String clientName, String docName);

    //回傳生產單位可查看的資料
    @Query("SELECT new com.zj.nld.DTO.NLDProdUnitRequest(" +
            "n.workOrderNum, n.clinicName, n.docName, " +
            "n.patientName, n.receivedDate, n.deliveryDate, " +
            "n.salesIdNum, n.toothPosition, n.prodName, " +
            "n.tryInDate, n.estFinishDate, n.workOrderStatus, " +
            "n.estTryInDate, n.isRemake, n.isNoCharge, " +
            "n.isPaused, n.isVoided, n.tryInReceivedDate, n.remarks) FROM NLD n")
    List<NLDProdUnitRequest> ProdUnitSearch();

    @org.springframework.lang.NonNull
    List<NLD> findAll();

}
