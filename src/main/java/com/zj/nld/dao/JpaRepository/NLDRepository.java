package com.zj.nld.dao.JpaRepository;

import com.zj.nld.model.NLD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@Component
public interface NLDRepository extends JpaRepository<NLD, UUID> {

    //找單筆NLD
    NLD findByExternalID(UUID externalID);

    List<NLD> findAll();

}
