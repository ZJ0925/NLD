package com.zj.nld.Model.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

public class NldClientDTO {

    private String workOrderNum;
    private String clinicName;
    private String docName;
    private String patientName;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date deliveryDate;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date receivedDate;

    private String toothPosition;
    private String prodName;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInDate;

    private String workOrderStatus;

    // ✅ 布林欄位 - 按正確順序
    private boolean isPaused;    // 1.暫停 (UN3E_DH)
    private boolean isVoided;    // 2.作廢 (UN2_DH)
    private boolean isNoCharge;  // 3.不計價 (CRM_DH)
    private boolean isRemake;    // 4.重製 (MODE3_DH)
    private boolean isReFix;     // 5.修整 (FIX_DH)

    private String remarks;
    private String salesName;

    // 空建構子
    public NldClientDTO() {
    }

    /**
     * ✅ 完整建構子 - 16個參數
     * 順序必須與 Repository 查詢一致!
     */
    public NldClientDTO(
            String workOrderNum,      // 1
            String clinicName,        // 2
            String docName,           // 3
            String patientName,       // 4
            Date deliveryDate,        // 5
            Date receivedDate,        // 6 ✅ 新增
            String toothPosition,     // 7
            String prodName,          // 8
            Date tryInDate,           // 9
            String workOrderStatus,   // 10
            boolean isPaused,         // 11
            boolean isVoided,         // 12
            boolean isNoCharge,       // 13
            boolean isRemake,         // 14
            boolean isReFix,          // 15
            String remarks,           // 16
            String salesName          // 17
    ) {
        this.workOrderNum = workOrderNum;
        this.clinicName = clinicName;
        this.docName = docName;
        this.patientName = patientName;
        this.deliveryDate = deliveryDate;
        this.receivedDate = receivedDate;  // ✅ 新增
        this.toothPosition = toothPosition;
        this.prodName = prodName;
        this.tryInDate = tryInDate;
        this.workOrderStatus = workOrderStatus;
        this.isPaused = isPaused;
        this.isVoided = isVoided;
        this.isNoCharge = isNoCharge;
        this.isRemake = isRemake;
        this.isReFix = isReFix;
        this.remarks = remarks;
        this.salesName = salesName;
    }

    // Getter/Setter
    public Date getReceivedDate() {
        return receivedDate;
    }

    public void setReceivedDate(Date receivedDate) {
        this.receivedDate = receivedDate;
    }

    public String getSalesName() {
        return salesName;
    }

    public void setSalesName(String salesName) {
        this.salesName = salesName;
    }

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

    public String getWorkOrderStatus() {
        return workOrderStatus;
    }

    public void setWorkOrderStatus(String workOrderStatus) {
        this.workOrderStatus = workOrderStatus;
    }

    public boolean isPaused() {
        return isPaused;
    }

    public void setPaused(boolean paused) {
        isPaused = paused;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }

    public boolean isNoCharge() {
        return isNoCharge;
    }

    public void setNoCharge(boolean noCharge) {
        isNoCharge = noCharge;
    }

    public boolean isRemake() {
        return isRemake;
    }

    public void setRemake(boolean remake) {
        isRemake = remake;
    }

    public boolean isReFix() {
        return isReFix;
    }

    public void setReFix(boolean reFix) {
        isReFix = reFix;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}