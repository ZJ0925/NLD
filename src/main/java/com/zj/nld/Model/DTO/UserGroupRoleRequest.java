package com.zj.nld.Model.DTO;

import com.zj.nld.Model.Entity.UserGroupRole;
import jakarta.persistence.Column;

import java.util.List;
import java.util.UUID;

public class UserGroupRoleRequest {

    private UUID externalID; // 全域唯一值

    private String lineID; // LINE ID

    private String userName; // 使用者名稱

    private String groupID;

    private String groupName;

    private int roleID;

    private List<UserGroupRoleRequest> groupList;


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

    public int getRoleID() {
        return roleID;
    }

    public void setRoleID(int roleID) {
        this.roleID = roleID;
    }

    public List<UserGroupRoleRequest> getGroupList() {
        return groupList;
    }

    public void setGroupList(List<UserGroupRoleRequest> groupList) {
        this.groupList = groupList;
    }

    public UserGroupRoleRequest(UserGroupRole userGroupRole) {
        this.externalID = userGroupRole.getExternalID();
        this.lineID = userGroupRole.getLineID();
        this.userName = userGroupRole.getUserName();
        this.groupID = userGroupRole.getGroupID();
        this.groupName = userGroupRole.getGroupName();
        this.roleID = userGroupRole.getRoleID();
    }

    // 空建構子
    public UserGroupRoleRequest() {}
}
