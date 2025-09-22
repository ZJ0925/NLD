package com.zj.nld.Model.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "UserGroupRole")
public class UserGroupRole {

    @Id
    @Column(name = "ExternalID")
    private UUID externalID; // 全域唯一值

    @Column(name = "LineID")
    private String lineID; // LINE ID

    @Column(name = "GroupID")
    private String groupID;

    @Column(name = "UserName")
    private String userName; // 使用者名稱

    @Column(name = "UserNameID")
    private String userNameID; // 使用者名稱

    @Column(name = "GroupName")
    private String groupName;

    @Column(name = "GroupNameID")
    private String groupNameID;

    @Column(name = "RoleID")
    private int roleID;

    public String getUserNameID() {
        return userNameID;
    }

    public void setUserNameID(String userNameID) {
        this.userNameID = userNameID;
    }

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

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getGroupNameID() {
        return groupNameID;
    }

    public void setGroupNameID(String groupNameID) {
        this.groupNameID = groupNameID;
    }

    public int getRoleID() {
        return roleID;
    }

    public void setRoleID(int roleID) {
        this.roleID = roleID;
    }
}
