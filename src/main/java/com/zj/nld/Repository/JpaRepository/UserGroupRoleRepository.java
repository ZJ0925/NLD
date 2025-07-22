package com.zj.nld.Repository.JpaRepository;

import com.zj.nld.Model.UserGroupRole;


public interface UserGroupRoleRepository {

    UserGroupRole findByLineIDAndGroupID(String lineID, String groupID);
}
