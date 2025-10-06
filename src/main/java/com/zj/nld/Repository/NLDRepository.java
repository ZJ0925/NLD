package com.zj.nld.Repository;

import com.zj.nld.Model.DTO.NldDTO;
import com.zj.nld.Model.DTO.NLDProdUnitDTO;
import com.zj.nld.Model.DTO.NldClientDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;
import com.zj.nld.Model.Entity.HVED;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.Date;
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
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.salesIdNum = :userNameID
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
    """)
    List<NldSalesDTO> SalesSearch(String userNameID, Pageable pageable);

    //回傳業務搜尋後可查看的資料
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
    JOIN VED v ON h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%'
    AND h.salesIdNum = :userNameID
    AND (:keyword IS NULL OR
          h.workOrderNum LIKE %:keyword% OR
          h.clinicName LIKE %:keyword% OR
          h.docName LIKE %:keyword% OR
          h.patientName LIKE %:keyword%)
    AND (:dateType IS NULL OR
          (:dateType = 'deliveryDate' AND h.deliveryDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'tryInDate' AND h.tryInDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'estFinishDate' AND h.estFinishDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'receivedDate' AND h.receivedDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'tryInReceivedDate' AND h.tryInReceivedDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'estTryInDate' AND h.estTryInDate BETWEEN :startDate AND :endDate))
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
    """)
    List<NldSalesDTO> SalesSearchWithFilters(
            @Param("userNameID") String userNameID,
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );


    //回傳牙助可查看的資料(診所)
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
     WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.cundh = :clientID
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
""")
    List<NldClientDTO> ClientSearch(String clientNameID, Pageable pageable);


    //回傳牙助搜尋後可查看的資料
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
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%' and h.cundh = :clientID
    AND (:keyword IS NULL OR
         h.workOrderNum LIKE %:keyword% OR
         h.patientName LIKE %:keyword%)
    AND (:dateType IS NULL OR
         (:dateType = 'deliveryDate' AND h.deliveryDate BETWEEN :startDate AND :endDate) OR
         (:dateType = 'tryInDate' AND h.tryInDate BETWEEN :startDate AND :endDate))
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
    """)
    List<NldClientDTO> ClientSearchWithFilters(
            String clientID,
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );




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
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.cundh = :clientID And h.docID = :docID
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
""")
    List<NldClientDTO> ClientForDocSearch(String clientID, String docID, Pageable pageable);

    //回傳醫生搜尋後可查看的資料
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
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%' and h.cundh = :clientID And h.docID = :userNameID
    AND (:keyword IS NULL OR
         h.workOrderNum LIKE %:keyword% OR
         h.patientName LIKE %:keyword%)
    AND (:dateType IS NULL OR
         (:dateType = 'deliveryDate' AND h.deliveryDate BETWEEN :startDate AND :endDate) OR
         (:dateType = 'tryInDate' AND h.tryInDate BETWEEN :startDate AND :endDate) OR
         (:dateType = 'estFinishDate' AND h.estFinishDate BETWEEN :startDate AND :endDate) OR
         (:dateType = 'receivedDate' AND h.receivedDate BETWEEN :startDate AND :endDate))
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
    """)
    List<NldClientDTO> ClientForDocWithFilters(
            String clientID,
            @Param("userNameID") String userNameID,
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );



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
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%'
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
""")
    List<NLDProdUnitDTO> ProdUnitSearch(Pageable pageable);


    //回傳生產單位搜尋後可查看的資料
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
    JOIN VED v ON
        h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%'
    AND (:keyword IS NULL OR
         h.workOrderNum LIKE %:keyword% OR
         h.docName LIKE %:keyword% OR
         h.clinicName LIKE %:keyword% OR
         h.patientName LIKE %:keyword%)OR
         s.name LIKE %:keyword%
    AND (:dateType IS NULL OR
          (:dateType = 'deliveryDate' AND h.deliveryDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'tryInDate' AND h.tryInDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'estFinishDate' AND h.estFinishDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'receivedDate' AND h.receivedDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'tryInReceivedDate' AND h.tryInReceivedDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'estTryInDate' AND h.estTryInDate BETWEEN :startDate AND :endDate))
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
    """)
    List<NLDProdUnitDTO> ProdUnitSearchWithFilters(
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );



    //回傳管理員可查看的資料
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
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%'
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
""")
    List<NldDTO> AdminSearch(Pageable pageable);


    //回傳管理員搜尋後可查看的資料
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
    JOIN VED v ON
        h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%'
    AND (:keyword IS NULL OR
         h.workOrderNum LIKE %:keyword% OR
         h.clinicName LIKE %:keyword% OR
         h.patientName LIKE %:keyword%)
    AND (:dateType IS NULL OR
          (:dateType = 'deliveryDate' AND h.deliveryDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'tryInDate' AND h.tryInDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'estFinishDate' AND h.estFinishDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'receivedDate' AND h.receivedDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'tryInReceivedDate' AND h.tryInReceivedDate BETWEEN :startDate AND :endDate) OR
          (:dateType = 'estTryInDate' AND h.estTryInDate BETWEEN :startDate AND :endDate))
    ORDER BY CAST(h.workOrderNum AS INTEGER) DESC
    """)
    List<NldDTO> AdminSearchWithFilters(
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );

}
