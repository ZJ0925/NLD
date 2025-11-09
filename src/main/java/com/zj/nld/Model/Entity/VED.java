package com.zj.nld.Model.Entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "VED")
public class VED {

    @Column(name = "COMP_D")
    private String comph;

    @Column(name = "NO_D")
    @Id
    private String nod;

    @Column(name = "REM_2_D")
    private String rem2d;

    @Column(name = "TEENO_D")
    private String toothPosition; // 8.齒位

    @Column(name = "MITEM_D")
    private String prodItem; // 9-1.製作項目

    @Column(name = "PRO_D")
    private String prodName; // 9-2. 產品名稱

    @Column(name = "PREC_D")
    private String workOrderStatus; // 13.工單現況

    @Column(name = "UNA_D")
    private Integer price; // 15.單價

    // ✅ 新增：基本費
    @Column(name = "QUAN2_D")
    private BigDecimal quan2D; // 基本費 (QUAN2_D)

    // Getter/Setter
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

    public String getWorkOrderStatus() {
        return workOrderStatus;
    }

    public void setWorkOrderStatus(String workOrderStatus) {
        this.workOrderStatus = workOrderStatus;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    // ✅ 新增 Getter/Setter
    public BigDecimal getQuan2D() {
        return quan2D;
    }

    public void setQuan2D(BigDecimal quan2D) {
        this.quan2D = quan2D;
    }

    public String getComph() {
        return comph;
    }

    public void setComph(String comph) {
        this.comph = comph;
    }

    public String getNod() {
        return nod;
    }

    public void setNod(String nod) {
        this.nod = nod;
    }

    public String getRem2d() {
        return rem2d;
    }

    public void setRem2d(String rem2d) {
        this.rem2d = rem2d;
    }
}