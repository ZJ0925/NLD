package com.zj.nld.Model.DTO;

import com.zj.nld.Model.Entity.UserGroupRole;

import java.util.List;
import java.util.UUID;

public class UserGroupRoleDTO {

    private UUID externalID; // 全域唯一值

    private String lineID; // LINE ID

    private String lineNiceName; // LINE 原始暱稱

    private String groupID;

    private String userName; // 使用者名稱

    private String userNameID; // 使用者名稱

    private String groupName;

    private String groupNameID;

    private int roleID;

    private List<UserGroupRoleDTO> groupList;

    public String getLineNiceName() {
        return lineNiceName;
    }

    public void setLineNiceName(String lineNiceName) {
        this.lineNiceName = lineNiceName;
    }

    public String getUserNameID() {
        return userNameID;
    }

    public void setUserNameID(String userNameID) {
        this.userNameID = userNameID;
    }

    public String getGroupNameID() {
        return groupNameID;
    }

    public void setGroupNameID(String groupNameID) {
        this.groupNameID = groupNameID;
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

    public int getRoleID() {
        return roleID;
    }

    public void setRoleID(int roleID) {
        this.roleID = roleID;
    }

    public List<UserGroupRoleDTO> getGroupList() {
        return groupList;
    }

    public void setGroupList(List<UserGroupRoleDTO> groupList) {
        this.groupList = groupList;
    }

    public UserGroupRoleDTO(UserGroupRole userGroupRole) {
        this.externalID = userGroupRole.getExternalID();
        this.lineID = userGroupRole.getLineID();
        this.lineNiceName = userGroupRole.getLineNiceName();
        this.groupID = userGroupRole.getGroupID();
        this.userName = userGroupRole.getUserName();
        this.userNameID = userGroupRole.getUserNameID();
        this.groupName = userGroupRole.getGroupName();
        this.groupNameID = userGroupRole.getGroupNameID();
        this.roleID = userGroupRole.getRoleID();
    }

    // 空建構子
    public UserGroupRoleDTO() {}
}
