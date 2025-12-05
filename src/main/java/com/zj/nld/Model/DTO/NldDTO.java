package com.zj.nld.Model.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class NldDTO {

    private String workOrderNum; // 1.技工單號
    private String clinicName; // 2.醫院名稱
    private String docName; // 3.醫師名稱
    private String patientName; // 4.患者名稱

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date receivedDate;  // 5.收件日

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date deliveryDate; // 6.完成交件日

    private String toothPosition; // 8.齒位
    private String prodItem; // 9-1.製作項目
    private String prodName; // 9-2. 產品名稱

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInDate; // 10.試戴交件

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date estFinishDate; // 11.預計完成日

    private String workOrderStatus; // 13.工單現況

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date estTryInDate; // 14.預計試戴日

    private Integer price; // 15.單價

    // ✅ 布林欄位 - 正確順序
    private boolean isPaused;    // 16.暫停 (UN3E_DH)
    private boolean isVoided;    // 17.作廢 (UN2_DH)
    private boolean isNoCharge;  // 18.不計價 (CRM_DH)
    private boolean isRemake;    // 19.重製 (MODE3_DH)
    private boolean isReFix;     // 20.修整 (FIX_DH)

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInReceivedDate; // 21.試戴收件日

    private String remarks; // 22.備註
    private String salesName;  // 用來接收 Sales.Name

    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    private BigDecimal baseFee;      // VED 基本費 (QUAN2_D)

    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    private BigDecimal totalAmount;  // HVED 總金額 (AMO_DH)

    private String tim2Dh;  // 試戴交件日時段
    private String tim3Dh;  // 預計完成日時段

    // ✅ 狀態標籤字段
    private String statusLabels;


    // 空的建構子
    public NldDTO() {
    }


    /**
     * ✅ 主要建構子 - 26個參數 (BigDecimal版本)
     * 用於列表查詢
     */
    public NldDTO(
            String workOrderNum,      // 1
            String clinicName,        // 2
            String docName,           // 3
            String patientName,       // 4
            Date receivedDate,        // 5
            Date deliveryDate,        // 6
            String toothPosition,     // 7
            String prodItem,          // 8
            String prodName,          // 9
            Date tryInDate,           // 10
            Date estFinishDate,       // 11
            String workOrderStatus,   // 12
            Date estTryInDate,        // 13
            Integer price,            // 14
            boolean isPaused,         // 15
            boolean isVoided,         // 16
            boolean isNoCharge,       // 17
            boolean isRemake,         // 18
            boolean isReFix,          // 19
            Date tryInReceivedDate,   // 20
            String remarks,           // 21
            String salesName,         // 22
            BigDecimal baseFee,       // 23
            BigDecimal totalAmount,   // 24
            String tim2Dh,            // 25
            String tim3Dh             // 26
    ) {
        this.workOrderNum = workOrderNum;
        this.clinicName = clinicName;
        this.docName = docName;
        this.patientName = patientName;
        this.receivedDate = receivedDate;
        this.deliveryDate = deliveryDate;
        this.toothPosition = toothPosition;
        this.prodItem = prodItem;
        this.prodName = prodName;
        this.tryInDate = tryInDate;
        this.estFinishDate = estFinishDate;
        this.workOrderStatus = workOrderStatus;
        this.estTryInDate = estTryInDate;
        this.price = price;
        this.isPaused = isPaused;
        this.isVoided = isVoided;
        this.isNoCharge = isNoCharge;
        this.isRemake = isRemake;
        this.isReFix = isReFix;
        this.tryInReceivedDate = tryInReceivedDate;
        this.remarks = remarks;
        this.salesName = salesName;
        this.baseFee = baseFee;
        this.totalAmount = totalAmount;
        this.tim2Dh = tim2Dh;
        this.tim3Dh = tim3Dh;

        // ✅ 自動生成狀態標籤
        this.statusLabels = generateStatusLabels();
    }

    /**
     * ✅ 重載建構子 - 26個參數 (Integer版本)
     * 用於處理資料庫返回 Integer 類型的情況
     */
    public NldDTO(
            String workOrderNum,
            String clinicName,
            String docName,
            String patientName,
            Date receivedDate,
            Date deliveryDate,
            String toothPosition,
            String prodItem,
            String prodName,
            Date tryInDate,
            Date estFinishDate,
            String workOrderStatus,
            Date estTryInDate,
            Integer price,
            boolean isPaused,
            boolean isVoided,
            boolean isNoCharge,
            boolean isRemake,
            boolean isReFix,
            Date tryInReceivedDate,
            String remarks,
            String salesName,
            Integer baseFee,         // ✅ Integer 版本
            Integer totalAmount,     // ✅ Integer 版本
            String tim2Dh,
            String tim3Dh
    ) {
        this.workOrderNum = workOrderNum;
        this.clinicName = clinicName;
        this.docName = docName;
        this.patientName = patientName;
        this.receivedDate = receivedDate;
        this.deliveryDate = deliveryDate;
        this.toothPosition = toothPosition;
        this.prodItem = prodItem;
        this.prodName = prodName;
        this.tryInDate = tryInDate;
        this.estFinishDate = estFinishDate;
        this.workOrderStatus = workOrderStatus;
        this.estTryInDate = estTryInDate;
        this.price = price;
        this.isPaused = isPaused;
        this.isVoided = isVoided;
        this.isNoCharge = isNoCharge;
        this.isRemake = isRemake;
        this.isReFix = isReFix;
        this.tryInReceivedDate = tryInReceivedDate;
        this.remarks = remarks;
        this.salesName = salesName;

        // ✅ 轉換 Integer 為 BigDecimal
        this.baseFee = baseFee != null ? BigDecimal.valueOf(baseFee) : null;
        this.totalAmount = totalAmount != null ? BigDecimal.valueOf(totalAmount) : null;

        this.tim2Dh = tim2Dh;
        this.tim3Dh = tim3Dh;

        // ✅ 自動生成狀態標籤
        this.statusLabels = generateStatusLabels();
    }

    /**
     * ✅ 生成狀態標籤字串
     * 按指定順序: 1.暫停 2.作廢 3.不計價 4.重製 5.修整
     */
    private String generateStatusLabels() {
        List<String> labels = new ArrayList<>();

        if (isPaused) labels.add("暫停");
        if (isVoided) labels.add("作廢");
        if (isNoCharge) labels.add("不計價");
        if (isRemake) labels.add("重製");
        if (isReFix) labels.add("修整");

        return labels.isEmpty() ? "" : String.join(" ", labels);
    }

    public String getStatusLabels() {
        if (statusLabels == null) {
            statusLabels = generateStatusLabels();
        }
        return statusLabels;
    }


    // ============= Getter/Setter =============

    public String getWorkOrderNum() {
        return workOrderNum;
    }

    public void setWorkOrderNum(String workOrderNum) {
        this.workOrderNum = workOrderNum;
    }

    public String getClinicName() {
        return clinicName;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public String getDocName() {
        return docName;
    }

    public void setDocName(String docName) {
        this.docName = docName;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Date getReceivedDate() {
        return receivedDate;
    }

    public void setReceivedDate(Date receivedDate) {
        this.receivedDate = receivedDate;
    }

    public Date getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(Date deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getToothPosition() {
        return toothPosition;
    }

    public void setToothPosition(String toothPosition) {
        this.toothPosition = toothPosition;
    }

    public String getProdItem() {
        return prodItem;
    }

    public void setProdItem(String prodItem) {
        this.prodItem = prodItem;
    }

    public String getProdName() {
        return prodName;
    }

    public void setProdName(String prodName) {
        this.prodName = prodName;
    }

    public Date getTryInDate() {
        return tryInDate;
    }

    public void setTryInDate(Date tryInDate) {
        this.tryInDate = tryInDate;
    }

    public Date getEstFinishDate() {
        return estFinishDate;
    }

    public void setEstFinishDate(Date estFinishDate) {
        this.estFinishDate = estFinishDate;
    }

    public String getWorkOrderStatus() {
        return workOrderStatus;
    }

    public void setWorkOrderStatus(String workOrderStatus) {
        this.workOrderStatus = workOrderStatus;
    }

    public Date getEstTryInDate() {
        return estTryInDate;
    }

    public void setEstTryInDate(Date estTryInDate) {
        this.estTryInDate = estTryInDate;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public boolean getPaused() {
        return isPaused;
    }

    public void setPaused(boolean paused) {
        isPaused = paused;
        this.statusLabels = generateStatusLabels();
    }

    public boolean getVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
        this.statusLabels = generateStatusLabels();
    }

    public boolean getNoCharge() {
        return isNoCharge;
    }

    public void setNoCharge(boolean noCharge) {
        isNoCharge = noCharge;
        this.statusLabels = generateStatusLabels();
    }

    public boolean getRemake() {
        return isRemake;
    }

    public void setRemake(boolean remake) {
        isRemake = remake;
        this.statusLabels = generateStatusLabels();
    }

    public boolean getReFix() {
        return isReFix;
    }

    public void setReFix(boolean reFix) {
        isReFix = reFix;
        this.statusLabels = generateStatusLabels();
    }

    public boolean isPaused() {
        return isPaused;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public boolean isNoCharge() {
        return isNoCharge;
    }

    public boolean isRemake() {
        return isRemake;
    }

    public boolean isReFix() {
        return isReFix;
    }

    public Date getTryInReceivedDate() {
        return tryInReceivedDate;
    }

    public void setTryInReceivedDate(Date tryInReceivedDate) {
        this.tryInReceivedDate = tryInReceivedDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getSalesName() {
        return salesName;
    }

    public void setSalesName(String salesName) {
        this.salesName = salesName;
    }

    public BigDecimal getBaseFee() {
        return baseFee;
    }

    public void setBaseFee(BigDecimal baseFee) {
        this.baseFee = baseFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getTim2Dh() {
        return tim2Dh;
    }

    public void setTim2Dh(String tim2Dh) {
        this.tim2Dh = tim2Dh;
    }

    public String getTim3Dh() {
        return tim3Dh;
    }

    public void setTim3Dh(String tim3Dh) {
        this.tim3Dh = tim3Dh;
    }
}