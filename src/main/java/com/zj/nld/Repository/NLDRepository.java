package com.zj.nld.Repository;

import com.zj.nld.Model.DTO.NldDTO;
import com.zj.nld.Model.DTO.NLDProdUnitDTO;
import com.zj.nld.Model.DTO.NldClientDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;
import com.zj.nld.Model.Entity.HVED;
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
    SELECT new com.zj.nld.Model.DTO.NldSalesDTO(
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
        h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%'
    """)
    List<NldSalesDTO> SalesSearch();


    //回傳客戶可查看的資料(診所)
    @Query("""
    SELECT new com.zj.nld.Model.DTO.NldClientDTO(
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
        h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.clinicName = :clientName
""")
    List<NldClientDTO> ClientSearch(String clientName);




    //回傳客戶可查看的資料(醫生)
    @Query("""
    SELECT new com.zj.nld.Model.DTO.NldClientDTO(
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
        h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.clinicName = :clientName And h.docName = :docName
""")
    List<NldClientDTO> ClientForDocSearch(String clientName, String docName);



    //回傳生產單位可查看的資料
    @Query("""
    SELECT new com.zj.nld.Model.DTO.NLDProdUnitDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
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
        h.remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN VED v ON h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%'
""")
    List<NLDProdUnitDTO> ProdUnitSearch();



    @Query("""
    SELECT new com.zj.nld.Model.DTO.NldDTO(
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
        h.remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN VED v ON h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%'
""")
    List<NldDTO> AdminSearch();

}
