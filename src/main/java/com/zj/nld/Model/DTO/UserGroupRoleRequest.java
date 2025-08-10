package com.zj.nld.Model.DTO;

import jakarta.persistence.Column;

import java.util.UUID;

public class UserGroupRoleRequest {

    private UUID externalID; // 全域唯一值

    private String lineID; // LINE ID

    private String userName; // 使用者名稱

    private String groupID;

    private int roleID;


    public UUID getExternalID() {
        return externalID;
    }

    public void setExternalID(UUID externalID) {
        this.externalID = externalID;
    }

    public String getLineID() {
        return lineID;
    }

    public void setLineID(String lineID) {
        this.lineID = lineID;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getGroupID() {
        return groupID;
    }

    public void setGroupID(String groupID) {
        this.groupID = groupID;
    }

    public int getRoleID() {
        return roleID;
    }

    public void setRoleID(int roleID) {
        this.roleID = roleID;
    }
}
