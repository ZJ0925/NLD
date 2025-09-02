package com.zj.nld.Model.DTO;

import com.zj.nld.Model.Entity.Sales;

// 業務DTO
public class SalesDTO {

    private String ID;


    private String Name;


    public String getID() {
        return ID;
    }

    public void setID(String ID) {
        this.ID = ID;
    }

    public String getName() {
        return Name;
    }

    public void setName(String name) {
        Name = name;
    }

    public SalesDTO(Sales sales) {
        this.ID = getID();
        this.Name = getName();
    }
}
