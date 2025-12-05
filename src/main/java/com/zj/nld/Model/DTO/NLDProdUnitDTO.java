package com.zj.nld.Model.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class NLDProdUnitDTO {

    private String workOrderNum;
    private String clinicName;
    private String docName;
    private String patientName;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date receivedDate;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date deliveryDate;

    private String toothPosition;
    private String prodName;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInDate;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date estFinishDate;

    private String workOrderStatus;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date estTryInDate;

    // ✅ 布林欄位 - 按正確順序
    private boolean isPaused;    // 1.暫停 (UN3E_DH)
    private boolean isVoided;    // 2.作廢 (UN2_DH)
    private boolean isNoCharge;  // 3.不計價 (CRM_DH)
    private boolean isRemake;    // 4.重製 (MODE3_DH)
    private boolean isReFix;     // 5.修整 (FIX_DH)

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInReceivedDate;

    private String remarks;
    private String salesName;

    // ✅ 新增：狀態標籤字段
    private String statusLabels;

    // 空建構子
    public NLDProdUnitDTO() {
    }

    /**
     * ✅ 完整建構子 - 20個參數
     * 順序必須與 Repository 查詢一致!
     */
    public NLDProdUnitDTO(
            String workOrderNum,      // 1
            String clinicName,        // 2
            String docName,           // 3
            String patientName,       // 4
            Date receivedDate,        // 5
            Date deliveryDate,        // 6
            String toothPosition,     // 7
            String prodName,          // 8
            Date tryInDate,           // 9
            Date estFinishDate,       // 10
            String workOrderStatus,   // 11
            Date estTryInDate,        // 12
            boolean isPaused,         // 13 ✅
            boolean isVoided,         // 14 ✅
            boolean isNoCharge,       // 15 ✅
            boolean isRemake,         // 16 ✅
            boolean isReFix,          // 17 ✅
            Date tryInReceivedDate,   // 18
            String remarks,           // 19
            String salesName          // 20
    ) {
        this.workOrderNum = workOrderNum;
        this.clinicName = clinicName;
        this.docName = docName;
        this.patientName = patientName;
        this.receivedDate = receivedDate;
        this.deliveryDate = deliveryDate;
        this.toothPosition = toothPosition;
        this.prodName = prodName;
        this.tryInDate = tryInDate;
        this.estFinishDate = estFinishDate;
        this.workOrderStatus = workOrderStatus;
        this.estTryInDate = estTryInDate;
        this.isPaused = isPaused;
        this.isVoided = isVoided;
        this.isNoCharge = isNoCharge;
        this.isRemake = isRemake;
        this.isReFix = isReFix;
        this.tryInReceivedDate = tryInReceivedDate;
        this.remarks = remarks;
        this.salesName = salesName;

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

    // ✅ Getter for statusLabels
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

    public boolean isPaused() {
        return isPaused;
    }

    public void setPaused(boolean paused) {
        isPaused = paused;
        this.statusLabels = generateStatusLabels(); // ✅ 更新時重新生成
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
        this.statusLabels = generateStatusLabels(); // ✅ 更新時重新生成
    }

    public boolean isNoCharge() {
        return isNoCharge;
    }

    public void setNoCharge(boolean noCharge) {
        isNoCharge = noCharge;
        this.statusLabels = generateStatusLabels(); // ✅ 更新時重新生成
    }

    public boolean isRemake() {
        return isRemake;
    }

    public void setRemake(boolean remake) {
        isRemake = remake;
        this.statusLabels = generateStatusLabels(); // ✅ 更新時重新生成
    }

    public boolean isReFix() {
        return isReFix;
    }

    public void setReFix(boolean reFix) {
        isReFix = reFix;
        this.statusLabels = generateStatusLabels(); // ✅ 更新時重新生成
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
}