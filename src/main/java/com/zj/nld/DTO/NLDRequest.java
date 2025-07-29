package com.zj.nld.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.Date;
import java.util.UUID;

public class NLDRequest {

    @NotNull
    private UUID externalID; //全域唯一值

    private String workOrderNum; // 1.技工單號

    private String clinicName; // 2.醫院名稱

    private String docName; // 3.醫師名稱

    private String patientName; // 4.患者名稱

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    private Date receivedDate;  // 5.收件日

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    private Date deliveryDate; // 6.完成交件日

    private String salesIdNum; // 7.業務名稱

    private String toothPosition; // 8.齒位

    private String prodItem; // 9-1.製作項目

    private String prodName; // 9-2. 產品名稱日

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    private Date tryInDate; // 10.試戴交件

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    private Date estFinishDate; // 11.預計完成日

    private String workOrderStatus; // 13.工單現況;

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    private Date estTryInDate; // 14.預計試戴日

    private Integer price; // 15.單價

    private boolean isRemake; // 16.重製

    private boolean isNoCharge; // 17.不計價

    private boolean isPaused; // 18.暫停

    private boolean isVoided; // 19.作廢

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    private Date tryInReceivedDate; // 20.試戴收件日

    private String remarks; // 21.試戴收件日


    public UUID getExternalID() {
        return externalID;
    }

    public void setExternalID(UUID externalID) {
        this.externalID = externalID;
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

    public String getSalesIdNum() {
        return salesIdNum;
    }

    public void setSalesIdNum(String salesIdNum) {
        this.salesIdNum = salesIdNum;
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
}
