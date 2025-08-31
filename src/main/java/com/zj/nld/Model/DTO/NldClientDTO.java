package com.zj.nld.Model.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class NldClientDTO {

    private String workOrderNum; // 1.技工單號

    private String clinicName; // 2.診所名稱

    private String docName; // 3.醫師名稱

    private String patientName; // 4.患者名稱

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    private Date deliveryDate; // 6.完成交件日

    private String toothPosition; //8.齒位

    private String prodName; // 9-2. 產品名稱日

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Taipei")//將後端格式轉換方便與前端對接
    private Date tryInDate; // 10.試戴交件

    private String workOrderStatus; // 13.工單現況;

    private boolean isRemake; // 16.重製

    private boolean isNoCharge; // 17.不計價

    private boolean isPaused; // 18.暫停

    private boolean isVoided; // 19.作廢

    private String remarks; // 21.備註

    public NldClientDTO(String workOrderNum, String clinicName, String docName, String patientName, Date deliveryDate, String toothPosition, String prodName, Date tryInDate, String workOrderStatus, boolean isRemake, boolean isNoCharge, boolean isPaused, boolean isVoided, String remarks) {
        this.workOrderNum = workOrderNum;
        this.clinicName = clinicName;
        this.docName = docName;
        this.patientName = patientName;
        this.deliveryDate = deliveryDate;
        this.toothPosition = toothPosition;
        this.prodName = prodName;
        this.tryInDate = tryInDate;
        this.workOrderStatus = workOrderStatus;
        this.isRemake = isRemake;
        this.isNoCharge = isNoCharge;
        this.isPaused = isPaused;
        this.isVoided = isVoided;
        this.remarks = remarks;
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

    public boolean isRemake() {
        return isRemake;
    }

    public void setRemake(boolean remake) {
        isRemake = remake;
    }

    public boolean isNoCharge() {
        return isNoCharge;
    }

    public void setNoCharge(boolean noCharge) {
        isNoCharge = noCharge;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}


