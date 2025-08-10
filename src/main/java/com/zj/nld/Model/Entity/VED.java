package com.zj.nld.Model.Entity;


import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "VED")
public class VED {


    @Column(name = "COMP_D")
    private String comph;


    @EmbeddedId
    private  VEDkey id;  // NO_D與 NUM_D 複合主鍵

    @Column(name = "TEENO_D")
    private String toothPosition; // 8.齒位-----------------

    @Column(name = "MITEM_D")
    private String prodItem; // 9-1.製作項目-----------------

    @Column(name = "PRO_D")
    private String prodName; // 9-2. 產品名稱日-----------------

    @Column(name = "PREC_D")
    private String workOrderStatus; // 13.工單現況;-----------------

    @Column(name = "UNA_D")
    private Integer price; // 15.單價-----------------


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
}
