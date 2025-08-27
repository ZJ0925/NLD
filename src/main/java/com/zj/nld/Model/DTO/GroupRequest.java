package com.zj.nld.Model.DTO;

import com.zj.nld.Model.Entity.UserGroupRole;

import java.util.List;
import java.util.UUID;

public class GroupRequest {

    private String groupID;

    private String groupName;





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


    public GroupRequest(String groupID, String groupName) {
        this.groupID = groupID;
        this.groupName = groupName;
    }
}
