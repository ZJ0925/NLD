package com.zj.nld.Model.Entity;

import jakarta.persistence.*;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "NLD")
public class NLD {

    @Id
    @Column(name = "ExternalID")
    private UUID externalID;

    @Column(name = "NO1_DH")
    private String workOrderNum; // 1.技工單號

    @Column(name = "CUN1_DH")
    private String clinicName; // 2.診所名稱

    @Column(name = "DOC1_DH")
    private String docName; // 3.醫師名稱

    @Column(name = "SNAM_DH")
    private String patientName; // 4.患者名稱

    @Column(name = "DAT_1_DH")
    private Date receivedDate;  // 5.收件日

    @Column(name = "DAT_4_DH")
    private Date deliveryDate; // 6.完成交件日

    @Column(name = "SALE_DH")
    private String salesIdNum; // 7.業務名稱

    @Column(name = "TEENO_D")
    private String toothPosition; // 8.齒位-----------------

    @Column(name = "MITEM_D")
    private String prodItem; // 9-1.製作項目-----------------

    @Column(name = "PRO_D")
    private String prodName; // 9-2. 產品名稱日-----------------

    @Column(name = "DAT_5_DH")
    private Date tryInDate; // 10.試戴交件

    @Column(name = "DAT_3_DH")
    private Date estFinishDate; // 11.預計完成日

    @Column(name = "PREC_D")
    private String workOrderStatus; // 13.工單現況;-----------------

    @Column(name = "DAT_2_DH")
    private Date estTryInDate; // 14.預計試戴日

    @Column(name = "UNA_D")
    private Integer price; // 15.單價-----------------

    @Column(name = "UN3E_DH")
    private boolean isRemake; // 16.重製

    @Column(name = "CRM_DH")
    private boolean isNoCharge; // 17.不計價

    @Column(name = "UN3_DH")
    private boolean isPaused; // 18.暫停

    @Column(name = "UN2_DH")
    private boolean isVoided; // 19.作廢

    @Column(name = "DAT_22_DH")
    private Date tryInReceivedDate; // 20.試戴收件日

    @Column(name = "RR__DH")
    private String remarks; // 21.備註

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

    public boolean isRemake() {
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
