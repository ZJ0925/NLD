package com.zj.nld.Model.DTO;

public class GroupDTO {

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


    public GroupDTO(String groupID, String groupName) {
        this.groupID = groupID;
        this.groupName = groupName;
    }
}
