package com.zj.nld.Model.DTO;

import com.zj.nld.Model.Entity.RoleManager;

public class RoleManagerDTO {

    private String lineID;
    private String lineName;

    // 空建構子（必須保留）
    public RoleManagerDTO() {
    }

    // 從 Entity 轉換的建構子（需要實作內容）
    public RoleManagerDTO(RoleManager roleManager) {
        this.lineID = roleManager.getLineID();     // 補上這行
        this.lineName = roleManager.getLineName(); // 補上這行
    }

    // 一般建構子
    public RoleManagerDTO(String lineID, String lineName) {
        this.lineID = lineID;
        this.lineName = lineName;
    }

    // Getters and Setters
    public String getLineID() {
        return lineID;
    }

    public void setLineID(String lineID) {
        this.lineID = lineID;
    }

    public String getLineName() {
        return lineName;
    }

    public void setLineName(String lineName) {
        this.lineName = lineName;
    }
}