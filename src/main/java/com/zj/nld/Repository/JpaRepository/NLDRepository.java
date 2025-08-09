package com.zj.nld.Repository.JpaRepository;

import com.zj.nld.DTO.NLDProdUnitRequest;
import com.zj.nld.DTO.NLDRequest;
import com.zj.nld.DTO.NldClientRequest;
import com.zj.nld.DTO.NldSalesRequest;
import com.zj.nld.Model.HVED;
import com.zj.nld.Model.NLD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@Component
public interface NLDRepository extends JpaRepository<HVED, UUID> {


    //回傳業務可查看的資料
    @Query("""
    SELECT new com.zj.nld.DTO.NldSalesRequest(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
        v.toothPosition,
        v.prodItem,
        v.prodName,
        h.tryInDate,
        h.estFinishDate,
        v.workOrderStatus,
        h.estTryInDate,
        v.price,
        h.isRemake,
        h.isNoCharge,
        h.isPaused,
        h.isVoided,
        h.tryInReceivedDate,
        h.remarks
    )
    FROM HVED h
    JOIN VED v ON
        h.compdh = v.comph 
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%'
    """)
    List<NldSalesRequest> SalesSearch();


    //回傳客戶可查看的資料(診所)
    @Query("""
    SELECT new com.zj.nld.DTO.NldClientRequest(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.deliveryDate,
        v.toothPosition,
        v.prodName,
        h.tryInDate,
        v.workOrderStatus,
        h.isRemake,
        h.isNoCharge,
        h.isPaused,
        h.isVoided,
        h.remarks
    )
    FROM HVED h
    JOIN VED v ON
        h.compdh = v.comph 
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.clinicName = :clientName
""")
    List<NldClientRequest> ClientSearch(String clientName);




    //回傳客戶可查看的資料(醫生)
    @Query("""
    SELECT new com.zj.nld.DTO.NldClientRequest(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.deliveryDate,
        v.toothPosition,
        v.prodName,
        h.tryInDate,
        v.workOrderStatus,
        h.isRemake,
        h.isNoCharge,
        h.isPaused,
        h.isVoided,
        h.remarks
    )
    FROM HVED h
    JOIN VED v ON
        h.compdh = v.comph 
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.clinicName = :clientName And h.docName = :docName
""")
    List<NldClientRequest> ClientForDocSearch(String clientName, String docName);



    //回傳生產單位可查看的資料
    @Query("""
    SELECT new com.zj.nld.DTO.NLDProdUnitRequest(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
        h.salesIdNum,
        v.toothPosition,
        v.prodName,
        h.tryInDate,
        h.estFinishDate,
        v.workOrderStatus,
        h.estTryInDate,
        h.isRemake,
        h.isNoCharge,
        h.isPaused,
        h.isVoided,
        h.tryInReceivedDate,
        h.remarks
    )
    FROM HVED h
    JOIN VED v ON
        h.compdh = v.comph 
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%'
""")
    List<NLDProdUnitRequest> ProdUnitSearch();



    @Query("""
    SELECT new com.zj.nld.DTO.NLDRequest(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
        h.salesIdNum,
        v.toothPosition,
        v.prodItem,
        v.prodName,
        h.tryInDate,
        h.estFinishDate,
        v.workOrderStatus,
        h.estTryInDate,
        v.price,
        h.isRemake,
        h.isNoCharge,
        h.isPaused,
        h.isVoided,
        h.tryInReceivedDate,
        h.remarks
    )
    FROM HVED h
    JOIN VED v ON
        h.compdh = v.comph 
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%'
""")
    List<NLDRequest> AdminSearch();


}
