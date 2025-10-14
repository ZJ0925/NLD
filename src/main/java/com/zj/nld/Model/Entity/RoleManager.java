package com.zj.nld.Model.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import javax.naming.Name;
@Entity
@Table(name = "RoleManager")
public class RoleManager {

    @Id
    @Column(name = "LineID")
    private String lineID;

    @Column(name = "LineName")
    private String lineName;

    // Getter
    public String getLineID() {
        return lineID;
    }

    // Setter - 加上 this.
    public void setLineID(String lineID) {
        this.lineID = lineID;
    }

    // Getter
    public String getLineName() {
        return lineName;
    }

    // Setter - 加上 this.
    public void setLineName(String lineName) {
        this.lineName = lineName;
    }
}