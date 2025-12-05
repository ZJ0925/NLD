package com.zj.nld.Model.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zj.nld.Converter.FTBooleanConverter;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "HVED")
public class HVED {

    @Column(name = "COMP_DH")
    private String compdh;

    @Column(name = "NO_DH")
    private String nodh;

    @Column(name = "REM_2_DH")
    private String rem2dh;

    @Column(name = "CUN_DH")
    private String cundh;

    @Id
    @Column(name = "NO1_DH")
    private String workOrderNum; // 1.技工單號

    @Column(name = "CUN1_DH")
    private String clinicName; // 2.診所名稱

    @Column(name = "DOC_DH")
    private String docID; // 3.醫師名稱

    @Column(name = "DOC1_DH")
    private String docName; // 3.醫師名稱

    @Column(name = "SNAM_DH")
    private String patientName; // 4.患者名稱

    @Column(name = "DAT_1_DH")
    private Date receivedDate;  // 5.收模日

    @Column(name = "DAT_4_DH")
    private Date deliveryDate; // 6.完成交件日

    @Column(name = "SALE_DH")
    private String salesIdNum; // 7.業務名稱

    @Column(name = "DAT_5_DH")
    private Date tryInDate; // 10.試戴交件日

    @Column(name = "DAT_3_DH")
    private Date estFinishDate; // 11.預計完成日

    @Column(name = "DAT_2_DH")
    private Date estTryInDate; // 14.預計試戴日

    @Column(name = "UN3E_DH")
    @Convert(converter = FTBooleanConverter.class)
    private boolean isPaused; // 16.暫停

    @Column(name = "UN2_DH")
    @Convert(converter = FTBooleanConverter.class)
    private boolean isVoided; // 17.作廢

    @Column(name = "CRM_DH")
    @Convert(converter = FTBooleanConverter.class)
    private boolean isNoCharge; // 18.不計價

    @Column(name = "MODE3_DH")
    @Convert(converter = FTBooleanConverter.class)
    private boolean isRemake; // 19.重製

    @Column(name = "FIX_DH")
    @Convert(converter = FTBooleanConverter.class)
    private boolean isReFix; // 20.修整

    @Column(name = "DAT_22_DH")
    private Date tryInReceivedDate; // 20.試戴收件日

    @Column(name = "RR__DH")
    private String remarks; // 21.備註

    // ✅ 新增：工單總金額
    @Column(name = "AMO_DH")
    private BigDecimal amoDh; // 工單總金額

    @Column(name = "VER_DH")
    private String salesName; // 或驗收業務名

    @Column(name = "TIM2_DH")
    private String tim2Dh; // 試戴交件日時段

    @Column(name = "TIM3_DH")
    private String tim3Dh; // 預計完成日時段

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

    public String getSalesName() {
        return salesName;
    }

    public void setSalesName(String salesName) {
        this.salesName = salesName;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SALE_DH", referencedColumnName = "NO_P1", insertable = false, updatable = false)
    @JsonIgnore // 忽略這個屬性
    private Sales sales; // 添加與 Sales 實體的關聯

    // Getter/Setter
    public Sales getSales() {
        return sales;
    }

    public void setSales(Sales sales) {
        this.sales = sales;
    }

    public String getCompdh() {
        return compdh;
    }

    public void setCompdh(String compdh) {
        this.compdh = compdh;
    }

    public String getDocID() {
        return docID;
    }

    public void setDocID(String docID) {
        this.docID = docID;
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

    public Date getEstTryInDate() {
        return estTryInDate;
    }

    public void setEstTryInDate(Date estTryInDate) {
        this.estTryInDate = estTryInDate;
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

    // ✅ 新增 Getter/Setter
    public BigDecimal getAmoDh() {
        return amoDh;
    }

    public void setAmoDh(BigDecimal amoDh) {
        this.amoDh = amoDh;
    }

    public String getNodh() {
        return nodh;
    }

    public void setNodh(String nodh) {
        this.nodh = nodh;
    }

    public String getRem2dh() {
        return rem2dh;
    }

    public void setRem2dh(String rem2dh) {
        this.rem2dh = rem2dh;
    }

    public String getCundh() {
        return cundh;
    }

    public void setCundh(String cundh) {
        this.cundh = cundh;
    }
}