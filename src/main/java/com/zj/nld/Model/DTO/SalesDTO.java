package com.zj.nld.Model.DTO;

import com.zj.nld.Model.Entity.Sales;

// 業務DTO
public class SalesDTO {

    private String id;


    private String name;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public SalesDTO(Sales sales) {
        this.id = sales.getId();
        this.name = sales.getName();
    }
}
