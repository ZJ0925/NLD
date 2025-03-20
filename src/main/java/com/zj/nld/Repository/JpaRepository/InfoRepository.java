package  com.zj.nld.Repository.JpaRepository;

import  com.zj.nld.Model.Info;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

@Component
@Repository
public interface InfoRepository extends JpaRepository<Info, Integer> {
    Info findByFormId(Integer formId);
}