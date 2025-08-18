package com.zj.nld.Model.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.zj.nld.Model.Entity.GroupRole;
import jakarta.persistence.Column;

public class GroupRoleRequest {

    @JsonProperty("GroupID")
    private String groupID; // 群組ID

    @JsonProperty("GroupName")
    private String groupName; // 群組名稱(EX:診所名稱)

    @JsonProperty("Description")
    private String description; // 群組描述

    @JsonProperty("RoleID")
    private Integer roleID;

    public GroupRoleRequest(GroupRole groupRole) {
        this.groupID = groupRole.getGroupID();
        this.groupName = groupRole.getGroupName();
        this.description = groupRole.getDescription();
        this.roleID = groupRole.getRoleID();
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getRoleID() {
        return roleID;
    }

    public void setRoleID(Integer roleID) {
        this.roleID = roleID;
    }

}
