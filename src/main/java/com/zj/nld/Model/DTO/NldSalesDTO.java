package com.zj.nld.Model.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;

public class NldSalesDTO {

    private String workOrderNum;
    private String clinicName;
    private String docName;
    private String patientName;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date receivedDate;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date deliveryDate;

    private String toothPosition;
    private String prodItem;
    private String prodName;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInDate;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date estFinishDate;

    private String workOrderStatus;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date estTryInDate;

    private Integer price;

    // ✅ 布林欄位 - 按正確順序
    private boolean isPaused;    // 1.暫停 (UN3E_DH)
    private boolean isVoided;    // 2.作廢 (UN2_DH)
    private boolean isNoCharge;  // 3.不計價 (CRM_DH)
    private boolean isRemake;    // 4.重製 (MODE3_DH)
    private boolean isReFix;     // 5.修整 (FIX_DH)

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInReceivedDate;

    private String remarks;

    // 空建構子
    public NldSalesDTO() {
    }

    /**
     * ✅ 完整建構子 - 21個參數
     * 順序必須與 Repository 查詢一致!
     */
    public NldSalesDTO(
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
            boolean isPaused,         // 15 ✅
            boolean isVoided,         // 16 ✅
            boolean isNoCharge,       // 17 ✅
            boolean isRemake,         // 18 ✅
            boolean isReFix,          // 19 ✅ 新增
            Date tryInReceivedDate,   // 20
            String remarks            // 21
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
    }

    // Getter/Setter

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
}