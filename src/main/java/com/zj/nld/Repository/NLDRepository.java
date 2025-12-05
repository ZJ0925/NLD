package com.zj.nld.Repository;

import com.zj.nld.Model.DTO.NldDTO;
import com.zj.nld.Model.DTO.NLDProdUnitDTO;
import com.zj.nld.Model.DTO.NldClientDTO;
import com.zj.nld.Model.DTO.NldSalesDTO;
import com.zj.nld.Model.Entity.HVED;
import com.zj.nld.Model.Entity.Sales;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Repository
@Component
public interface NLDRepository extends JpaRepository<HVED, UUID> {

    // ===== 業務查詢 =====

    //回傳業務可查看的資料 - 去重（移除remarks和prodName以避免TEXT類型問題）
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NldSalesDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
        NULL as toothPosition,
        NULL as prodItem,
        NULL as prodName,
        h.tryInDate,
        h.estFinishDate,
        NULL as workOrderStatus,
        h.estTryInDate,
        NULL as price,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.tryInReceivedDate,
        NULL as remarks
    )
    FROM HVED h
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.salesIdNum = :userNameID
    ORDER BY h.receivedDate DESC
    """)
    List<NldSalesDTO> SalesSearch(String userNameID, Pageable pageable);

    //回傳業務搜尋後可查看的資料 - 只有開始日期
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NldSalesDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
        NULL as toothPosition,
        NULL as prodItem,
        NULL as prodName,
        h.tryInDate,
        h.estFinishDate,
        NULL as workOrderStatus,
        h.estTryInDate,
        NULL as price,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.tryInReceivedDate,
        NULL as remarks
    )
    FROM HVED h
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%'
    AND h.salesIdNum = :userNameID
    AND (:keyword IS NULL OR
          h.workOrderNum LIKE %:keyword% OR
          h.clinicName LIKE %:keyword% OR
          h.docName LIKE %:keyword% OR
          h.patientName LIKE %:keyword%)
    AND (:dateType IS NULL OR :startDate IS NULL OR
           (:dateType = 'receivedDate' AND h.receivedDate = :startDate) OR
           (:dateType = 'deliveryDate' AND (h.deliveryDate = :startDate OR h.tryInDate = :startDate)) OR
           (:dateType = 'estFinishDate' AND (h.estFinishDate = :startDate OR h.estTryInDate = :startDate)))
      
          ORDER BY h.receivedDate DESC
    """)
    List<NldSalesDTO> SalesSearchWithFilters(
            @Param("userNameID") String userNameID,
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate
    );

    // ===== 牙助查詢 =====

    //回傳牙助可查看的資料(診所)
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NldClientDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.deliveryDate,
        h.receivedDate,
        NULL as toothPosition,
        NULL as prodName,
        h.tryInDate,
        NULL as workOrderStatus,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        NULL as remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%' AND h.cundh = :clientID
    ORDER BY h.receivedDate DESC
""")
    List<NldClientDTO> AssistantSearch(String clientID, Pageable pageable);

    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NldClientDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.deliveryDate,
        h.receivedDate,
        NULL as toothPosition,
        NULL as prodName,
        h.tryInDate,
        NULL as workOrderStatus,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        NULL as remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001'
    AND h.cundh LIKE 'K%' 
    AND h.cundh = :clientID
    AND (:keyword IS NULL OR
         h.workOrderNum LIKE %:keyword% OR
         h.patientName LIKE %:keyword% OR
         h.docName LIKE %:keyword%)
    AND (:dateType IS NULL OR
         (:dateType = 'receivedDate' AND (:startDate IS NULL OR h.receivedDate >= :startDate)) OR
         (:dateType = 'deliveryDate' AND (:startDate IS NULL OR h.deliveryDate >= :startDate OR h.tryInDate >= :startDate)) OR
         (:dateType = 'estFinishDate' AND (:startDate IS NULL OR h.estFinishDate >= :startDate OR h.estTryInDate >= :startDate)))
    ORDER BY h.receivedDate DESC
""")
    List<NldClientDTO> AssistantSearchWithFilters(
            @Param("clientID") String clientID,
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate
    );

    // ===== 醫生查詢 =====

    //回傳客戶可查看的資料(醫生)
    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NldClientDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.deliveryDate,
        h.receivedDate,
        NULL as toothPosition,
        NULL as prodName,
        h.tryInDate,
        NULL as workOrderStatus,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        NULL as remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001' 
      AND h.cundh LIKE 'K%' 
      AND h.docID = :docID
    ORDER BY h.receivedDate DESC
    """)
    List<NldClientDTO> DocSearch(
            @Param("docID") String docID,
            Pageable pageable
    );


    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NldClientDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.deliveryDate,
        h.receivedDate,
        NULL as toothPosition,
        NULL as prodName,
        h.tryInDate,
        NULL as workOrderStatus,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        NULL as remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001'
      AND h.cundh LIKE 'K%' 
      AND h.docID = :docID
      AND (:keyword IS NULL OR
           h.workOrderNum LIKE %:keyword% OR
           h.clinicName LIKE %:keyword% OR
           h.patientName LIKE %:keyword% OR
           h.docName LIKE %:keyword%) 
      AND (:dateType IS NULL OR
           (:dateType = 'receivedDate' AND (:startDate IS NULL OR h.receivedDate >= :startDate)) OR
           (:dateType = 'deliveryDate' AND (:startDate IS NULL OR h.deliveryDate >= :startDate OR h.tryInDate >= :startDate)) OR
           (:dateType = 'estFinishDate' AND (:startDate IS NULL OR h.estFinishDate >= :startDate OR h.estTryInDate >= :startDate)))
    ORDER BY h.receivedDate DESC
    """)
    List<NldClientDTO> DocWithFilters(
            @Param("docID") String docID,
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate
    );

    // ===== 生產單位查詢 =====

    //回傳生產單位可查看的資料
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NLDProdUnitDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
        NULL as toothPosition,
        NULL as prodName,
        h.tryInDate,
        h.estFinishDate,
        NULL as workOrderStatus,
        h.estTryInDate,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.tryInReceivedDate,
        NULL as remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%'
    ORDER BY h.receivedDate DESC
    """)
    List<NLDProdUnitDTO> ProdUnitSearch(Pageable pageable);

    //回傳生產單位搜尋後可查看的資料
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
    @Query("""
SELECT DISTINCT new com.zj.nld.Model.DTO.NLDProdUnitDTO(
    h.workOrderNum,
    h.clinicName,
    h.docName,
    h.patientName,
    h.receivedDate,
    h.deliveryDate,
    NULL as toothPosition,
    NULL as prodName,
    h.tryInDate,
    h.estFinishDate,
    NULL as workOrderStatus,
    h.estTryInDate,
    h.isPaused,
    h.isVoided,
    h.isNoCharge,
    h.isRemake,
    h.isReFix,
    h.tryInReceivedDate,
    NULL as remarks,
    s.name as salesName
)
FROM HVED h
JOIN Sales s ON h.salesIdNum = s.id
WHERE h.compdh = '001'
  AND h.cundh LIKE 'K%'
  AND (:keyword IS NULL OR
       h.workOrderNum LIKE %:keyword% OR
       h.clinicName LIKE %:keyword% OR
       h.patientName LIKE %:keyword% OR
       h.docName LIKE %:keyword% OR
       s.name LIKE %:keyword%)
  AND (:dateType IS NULL OR :startDate IS NULL OR
       (:dateType = 'receivedDate' AND h.receivedDate = :startDate) OR
       (:dateType = 'deliveryDate' AND (h.deliveryDate = :startDate OR h.tryInDate = :startDate)) OR
       (:dateType = 'estFinishDate' AND (h.estFinishDate = :startDate OR h.estTryInDate = :startDate)))
ORDER BY h.receivedDate DESC
""")
    List<NLDProdUnitDTO> ProdUnitSearchWithFilters(
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate
    );

    // ===== 管理員查詢 =====

    //回傳管理員可查看的資料 - 去重列表
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NldDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
        NULL as toothPosition,
        NULL as prodItem,
        NULL as prodName,
        h.tryInDate,
        h.estFinishDate,
        NULL as workOrderStatus,
        h.estTryInDate,
        NULL as price,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.tryInReceivedDate,
        NULL as remarks,
        s.name as salesName,
        NULL as baseFee,
        h.amoDh as totalAmount,
        h.tim2Dh,
        h.tim3Dh
    )
    FROM HVED h
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001' AND h.cundh LIKE 'K%'
    ORDER BY h.receivedDate DESC
    """)
    List<NldDTO> AdminSearch(Pageable pageable);

    // 管理員搜尋篩選 - 去重搜尋結果 - 只有開始日期
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
    @Query("""
    SELECT DISTINCT new com.zj.nld.Model.DTO.NldDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.receivedDate,
        h.deliveryDate,
        NULL as toothPosition,
        NULL as prodItem,
        NULL as prodName,
        h.tryInDate,
        h.estFinishDate,
        NULL as workOrderStatus,
        h.estTryInDate,
        NULL as price,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.tryInReceivedDate,
        NULL as remarks,
        s.name as salesName,
        NULL as baseFee,
        h.amoDh as totalAmount,
        h.tim2Dh,
        h.tim3Dh
    )
    FROM HVED h
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.compdh = '001'
      AND h.cundh LIKE 'K%'
      AND (:saleName IS NULL OR h.salesName = :saleName)
      AND (:keyword IS NULL OR
           h.workOrderNum LIKE %:keyword% OR
           h.clinicName LIKE %:keyword% OR
           h.docName LIKE %:keyword% OR
           h.patientName LIKE %:keyword%)
             
      AND (:dateType IS NULL OR :startDate IS NULL OR
           (:dateType = 'receivedDate' AND h.receivedDate = :startDate) OR
           (:dateType = 'deliveryDate' AND (h.deliveryDate = :startDate OR h.tryInDate = :startDate)) OR
           (:dateType = 'estFinishDate' AND (h.estFinishDate = :startDate OR h.estTryInDate = :startDate)))
            
    ORDER BY h.receivedDate DESC
    """)
    List<NldDTO> AdminSearchWithFilters(
            @Param("keyword") String keyword,
            @Param("dateType") String dateType,
            @Param("startDate") Date startDate,
            @Param("saleName") String saleName
    );

    /**
     * 更新工單備註
     * @return 更新的行數
     */
    @Modifying
    @Transactional
    @Query("""
    UPDATE HVED h
    SET h.remarks = :remarks
    WHERE h.workOrderNum = :workOrderNum 
      AND h.compdh = '001' 
      AND h.cundh LIKE 'K%'
    """)
    int updateWorkOrderRemarks(
            @Param("workOrderNum") String workOrderNum,
            @Param("remarks") String remarks
    );

    /**
     * 取得所有業務人員列表
     */
    @Query("""
    SELECT s 
    FROM Sales s
    WHERE s.work3P1 = '公司業務'
      AND s.name IN (
           SELECT DISTINCT h.salesName
           FROM HVED h
           WHERE h.compdh = '001'
             AND h.cundh LIKE 'K%'
      )
    ORDER BY s.id ASC
""")
    List<Sales> getSalesList();

    // ===== 詳細資料查詢（顯示所有相關 VED 資料）=====
    // 注意：詳細查詢不使用 DISTINCT，允許返回所有相關記錄

    // 管理員 - 查詢詳細數據（包含所有 VED 資料）
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
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
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.tryInReceivedDate,
        h.remarks,
        s.name as salesName,
        v.quan2D as baseFee,
        h.amoDh as totalAmount,
        h.tim2Dh,
        h.tim3Dh
    )
    FROM HVED h
    JOIN VED v ON h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.workOrderNum = :workOrderNum AND h.compdh = '001' AND h.cundh LIKE 'K%'
    ORDER BY v.toothPosition ASC
    """)
    List<NldDTO> AdminGetDetailByWorkOrderNum(@Param("workOrderNum") String workOrderNum);

    // 業務 - 查詢詳細數據
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
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
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.tryInReceivedDate,
        h.remarks
    )
    FROM HVED h
    JOIN VED v ON h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    WHERE h.workOrderNum = :workOrderNum 
      AND h.compdh = '001' 
      AND h.cundh LIKE 'K%'
      AND h.salesIdNum = :userNameID
    ORDER BY v.toothPosition ASC
    """)
    List<NldSalesDTO> SalesGetDetailByWorkOrderNum(
            @Param("userNameID") String userNameID,
            @Param("workOrderNum") String workOrderNum
    );

    // 醫生 - 查詢詳細數據
    @Query("""
    SELECT new com.zj.nld.Model.DTO.NldClientDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.deliveryDate,
        h.receivedDate,
        v.toothPosition,
        v.prodName,
        h.tryInDate,
        v.workOrderStatus,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN VED v ON h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.workOrderNum = :workOrderNum 
      AND h.compdh = '001' 
      AND h.cundh LIKE 'K%'
      AND h.docID = :docID
    ORDER BY v.toothPosition ASC
""")
    List<NldClientDTO> DocGetDetailByWorkOrderNum(
            @Param("docID") String docID,
            @Param("workOrderNum") String workOrderNum
    );

    // 牙助 - 查詢詳細數據
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
    @Query("""
    SELECT new com.zj.nld.Model.DTO.NldClientDTO(
        h.workOrderNum,
        h.clinicName,
        h.docName,
        h.patientName,
        h.deliveryDate,
        h.receivedDate,
        v.toothPosition,
        v.prodName,
        h.tryInDate,
        v.workOrderStatus,
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN VED v ON h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.workOrderNum = :workOrderNum 
      AND h.compdh = '001' 
      AND h.cundh LIKE 'K%'
      AND h.cundh = :clientID
    ORDER BY v.toothPosition ASC
""")
    List<NldClientDTO> AssistantGetDetailByWorkOrderNum(
            @Param("clientID") String clientID,
            @Param("workOrderNum") String workOrderNum
    );

    // 生產單位 - 查詢詳細數據
    // ✅ 修正順序: isPaused, isVoided, isNoCharge, isRemake, isReFix
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
        h.isPaused,
        h.isVoided,
        h.isNoCharge,
        h.isRemake,
        h.isReFix,
        h.tryInReceivedDate,
        h.remarks,
        s.name as salesName
    )
    FROM HVED h
    JOIN VED v ON h.compdh = v.comph AND h.nodh = v.nod AND h.rem2dh = v.rem2d
    JOIN Sales s ON h.salesIdNum = s.id
    WHERE h.workOrderNum = :workOrderNum AND h.compdh = '001' AND h.cundh LIKE 'K%'
    ORDER BY v.toothPosition ASC
    """)
    List<NLDProdUnitDTO> ProdUnitGetDetailByWorkOrderNum(@Param("workOrderNum") String workOrderNum);
}