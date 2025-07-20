package com.zj.nld.dao.JpaRepository;

import com.zj.nld.dto.NLDProdUntiRequest;
import com.zj.nld.dto.NldClientRequest;
import com.zj.nld.dto.NldSalesRequest;
import com.zj.nld.model.NLD;
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


    @Query("SELECT new com.zj.nld.dto.NldSalesRequest(" +
            "n.workOrderNum, n.clinicName, n.docName, " +
            "n.patientName, n.receivedDate, n.deliveryDate, " +
            "n.toothPosition, n.prodItem, n.prodName, " +
            "n.tryInDate, n.estFinishDate, n.workOrderStatus, " +
            "n.estTryInDate, n.price, n.isRemake, n.isNoCharge, " +
            "n.isPaused, n.isVoided, n.tryInReceivedDate, n.remarks) " +
            "FROM NLD n")
    List<NldSalesRequest> SalesSearch();

    @Query("SELECT new com.zj.nld.dto.NldClientRequest(" +
            "n.workOrderNum, n.docName, n.patientName, " +
            "n.deliveryDate, n.toothPosition, n.prodName, " +
            "n.tryInDate, n.workOrderStatus, n.isRemake, " +
            "n.isNoCharge, n.isPaused, n.isVoided, n.remarks) FROM NLD n")
    List<NldClientRequest> ClientSearch();

    @Query("SELECT new com.zj.nld.dto.NLDProdUntiRequest(" +
            "n.workOrderNum, n.clinicName, n.docName, " +
            "n.patientName, n.receivedDate, n.deliveryDate, " +
            "n.salesIdNum, n.toothPosition, n.prodName, " +
            "n.tryInDate, n.estFinishDate, n.workOrderStatus, " +
            "n.estTryInDate, n.isRemake, n.isNoCharge, " +
            "n.isPaused, n.isVoided, n.tryInReceivedDate, n.remarks) FROM NLD n")
    List<NLDProdUntiRequest> ProdUntiSearch();

    List<NLD> findAll();

}
