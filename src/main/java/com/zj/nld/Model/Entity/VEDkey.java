package com.zj.nld.Model.Entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class VEDkey implements Serializable {

    private String NO_D;
    private String NUM_D;

    public VEDkey() {}

    public VEDkey(String NO_D, String NUM_D) {
        this.NO_D = NO_D;
        this.NUM_D = NUM_D;
    }

    public String getNO_D() {
        return NO_D;
    }

    public void setNO_D(String NO_D) {
        this.NO_D = NO_D;
    }

    public String getNUM_D() {
        return NUM_D;
    }

    public void setNUM_D(String NUM_D) {
        this.NUM_D = NUM_D;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VEDkey)) return false;
        VEDkey vedKey = (VEDkey) o;
        return Objects.equals(NO_D, vedKey.NO_D) && Objects.equals(NUM_D, vedKey.NUM_D);
    }

    @Override
    public int hashCode() {
        return Objects.hash(NO_D, NUM_D);
    }
}
