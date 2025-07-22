package com.zj.nld.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "UserGroupRole")
public class UserGroupRole {

    @Id
    @Column(name = "ExternalID")
    private String externalID; // 全域唯一值

    @Column(name = "LineID")
    private String lineID; // LINE ID

    @Column(name = "UserName")
    private String userName; // 使用者名稱

    @Column(name = "GroupID")
    private String groupID;

    @Column(name = "RoleID")
    private int roleID;

    public String getExternalID() {
        return externalID;
    }

    public void setExternalID(String externalID) {
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
