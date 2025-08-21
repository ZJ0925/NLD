package com.zj.nld.Model.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "GroupRole")
public class GroupRole {

    @Id
    @Column(name = "GroupID")
    private String groupID; // 群組ID

    @Column(name = "GroupName")
    private String groupName; // 群組名稱(EX:診所名稱)

    @Column(name = "RoleID")
    private Integer roleID;


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


    public Integer getRoleID() {
        return roleID;
    }

    public void setRoleID(Integer roleID) {
        this.roleID = roleID;
    }
}
