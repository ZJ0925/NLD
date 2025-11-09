package com.zj.nld.Model.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;
import java.math.BigDecimal;  // ✅ 新增 import

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
    private String prodName; // 9-2. 產品名稱日

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInDate; // 10.試戴交件

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date estFinishDate; // 11.預計完成日

    private String workOrderStatus; // 13.工單現況;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date estTryInDate; // 14.預計試戴日

    private Integer price; // 15.單價
    private boolean isRemake; // 16.重製
    private boolean isNoCharge; // 17.不計價
    private boolean isPaused; // 18.暫停
    private boolean isVoided; // 19.作廢

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")
    private Date tryInReceivedDate; // 20.試戴收件日

    private String remarks; // 21.試戴收件日
    private String salesName;  // 用來接收 Sales.Name

    // ✅ 新增字段
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    private BigDecimal baseFee;      // VED 基本費 (QUAN2_D)

    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    private BigDecimal totalAmount;  // HVED 總金額 (AMO_DH)


    // 空的建構子
    public NldDTO() {
    }


    // 原有建構子
    public NldDTO(String workOrderNum, String clinicName, String docName, String patientName,
                  Date receivedDate, Date deliveryDate, String toothPosition, String prodItem,
                  String prodName, Date tryInDate, Date estFinishDate, String workOrderStatus,
                  Date estTryInDate, Integer price, boolean isRemake, boolean isNoCharge, boolean isPaused,
                  boolean isVoided, Date tryInReceivedDate, String remarks, String salesName,
                  BigDecimal baseFee, BigDecimal totalAmount) {
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
        this.isRemake = isRemake;
        this.isNoCharge = isNoCharge;
        this.isPaused = isPaused;
        this.isVoided = isVoided;
        this.tryInReceivedDate = tryInReceivedDate;
        this.remarks = remarks;
        this.salesName = salesName;
        this.baseFee = baseFee;
        this.totalAmount = totalAmount;

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

    public boolean getRemake() {
        return isRemake;
    }

    public void setRemake(boolean remake) {
        isRemake = remake;
    }

    public boolean getNoCharge() {
        return isNoCharge;
    }

    public void setNoCharge(boolean noCharge) {
        isNoCharge = noCharge;
    }

    public boolean getPaused() {
        return isPaused;
    }

    public void setPaused(boolean paused) {
        isPaused = paused;
    }

    public boolean getVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
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

    public boolean isRemake() {
        return isRemake;
    }

    public boolean isNoCharge() {
        return isNoCharge;
    }

    public boolean isPaused() {
        return isPaused;
    }

    public boolean isVoided() {
        return isVoided;
    }

    // ✅ 新增 Getter/Setter
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
}