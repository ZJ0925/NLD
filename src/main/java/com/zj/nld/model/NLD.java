package com.zj.nld.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "NLD")
public class NLD {

    @Id
    private UUID ExternalID;

    @Column(name = "NO1_DH")
    private String WorkOrderNum; // 1.技工單號

    @Column(name = "CUN1_DH")
    private String ClinicName; // 2.診所名稱

    @Column(name = "DOC1_DH")
    private String DocName; // 3.醫師名稱

    @Column(name = "SNAM_DH")
    private String PatientName; // 4.患者名稱

    @Column(name = "DAT_1_DH")
    private Date ReceivedDate;  // 5.收件日

    @Column(name = "DAT_4_DH")
    private Date DeliveryDate; // 6.完成交件日

    @Column(name = "SALE_DH")
    private String SalesIdNum; // 7.業務身分證字號

    @Column(name = "TEENO_D")
    private String ToothPosition; //

    @Column(name = "MITEM_D")
    private String ProdItem; // 9-1.製作項目

    @Column(name = "PRO_D")
    private String ProdName; // 9-2. 產品名稱日

    @Column(name = "DAT_5_DH")
    private Date TryInDate; // 10.試戴交件

    @Column(name = "DAT_3_DH")
    private Date EstFinishDate; // 11.預計完成日

    @Column(name = "PREC_D")
    private String WorkOrderStatus; // 13.派工別;

    @Column(name = "DAT_2_DH")
    private Date EstTryInDate; // 14.預計試戴日

    @Column(name = "UNA_D")
    private Integer Price; // 15.單價

    @Column(name = "UN3E_DH")
    private boolean IsRemake; // 16.重製

    @Column(name = "CRM_DH")
    private Boolean IsNoCharge; // 17.不計價

    @Column(name = "UN3_DH")
    private Boolean IsPaused; // 18.暫停

    @Column(name = "UN2_DH")
    private Boolean IsVoided; // 19.作廢

    @Column(name = "DAT_22_DH")
    private Date TryInReceivedDate; // 20.試戴收件日

    @Column(name = "RR__DH")
    private String Remarks; // 21.備註


    public UUID getExternalID() {
        return ExternalID;
    }

    public void setExternalID(UUID externalID) {
        ExternalID = externalID;
    }

    public String getWorkOrderNum() {
        return WorkOrderNum;
    }

    public void setWorkOrderNum(String workOrderNum) {
        WorkOrderNum = workOrderNum;
    }

    public String getClinicName() {
        return ClinicName;
    }

    public void setClinicName(String clinicName) {
        ClinicName = clinicName;
    }

    public String getDocName() {
        return DocName;
    }

    public void setDocName(String docName) {
        DocName = docName;
    }

    public String getPatientName() {
        return PatientName;
    }

    public void setPatientName(String patientName) {
        PatientName = patientName;
    }

    public Date getReceivedDate() {
        return ReceivedDate;
    }

    public void setReceivedDate(Date receivedDate) {
        ReceivedDate = receivedDate;
    }

    public Date getDeliveryDate() {
        return DeliveryDate;
    }

    public void setDeliveryDate(Date deliveryDate) {
        DeliveryDate = deliveryDate;
    }

    public String getSalesIdNum() {
        return SalesIdNum;
    }

    public void setSalesIdNum(String salesIdNum) {
        SalesIdNum = salesIdNum;
    }

    public String getToothPosition() {
        return ToothPosition;
    }

    public void setToothPosition(String toothPosition) {
        ToothPosition = toothPosition;
    }

    public String getProdItem() {
        return ProdItem;
    }

    public void setProdItem(String prodItem) {
        ProdItem = prodItem;
    }

    public String getProdName() {
        return ProdName;
    }

    public void setProdName(String prodName) {
        ProdName = prodName;
    }

    public Date getTryInDate() {
        return TryInDate;
    }

    public void setTryInDate(Date tryInDate) {
        TryInDate = tryInDate;
    }

    public Date getEstFinishDate() {
        return EstFinishDate;
    }

    public void setEstFinishDate(Date estFinishDate) {
        EstFinishDate = estFinishDate;
    }

    public String getWorkOrderStatus() {
        return WorkOrderStatus;
    }

    public void setWorkOrderStatus(String workOrderStatus) {
        WorkOrderStatus = workOrderStatus;
    }

    public Date getEstTryInDate() {
        return EstTryInDate;
    }

    public void setEstTryInDate(Date estTryInDate) {
        EstTryInDate = estTryInDate;
    }

    public Integer getPrice() {
        return Price;
    }

    public void setPrice(Integer price) {
        Price = price;
    }

    public boolean isRemake() {
        return IsRemake;
    }

    public void setRemake(boolean remake) {
        IsRemake = remake;
    }

    public Boolean getNoCharge() {
        return IsNoCharge;
    }

    public void setNoCharge(Boolean noCharge) {
        IsNoCharge = noCharge;
    }

    public Boolean getPaused() {
        return IsPaused;
    }

    public void setPaused(Boolean paused) {
        IsPaused = paused;
    }

    public Boolean getVoided() {
        return IsVoided;
    }

    public void setVoided(Boolean voided) {
        IsVoided = voided;
    }

    public Date getTryInReceivedDate() {
        return TryInReceivedDate;
    }

    public void setTryInReceivedDate(Date tryInReceivedDate) {
        TryInReceivedDate = tryInReceivedDate;
    }

    public String getRemarks() {
        return Remarks;
    }

    public void setRemarks(String remarks) {
        Remarks = remarks;
    }
}
