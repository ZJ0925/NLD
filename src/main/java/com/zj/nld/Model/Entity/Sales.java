package com.zj.nld.Model.Entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "E_PEP1")
public class Sales {

    @Column(name = "NO_P1")
    @Id
    private String id;

    @Column(name = "NAM_P1")
    private String name;

    // ✅ 新增：工作類型
    @Column(name = "WORK3_P1")
    private String work3P1;

    public String getWork3P1() {
        return work3P1;
    }

    public void setWork3P1(String work3P1) {
        this.work3P1 = work3P1;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
