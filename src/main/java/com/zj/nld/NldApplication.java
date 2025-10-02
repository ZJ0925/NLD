package com.zj.nld;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.security.Security;

@SpringBootApplication
public class NldApplication {

    //開發時註解
    static {
        // 移除 TLSv1 和 TLSv1.1 從禁用清單
        Security.setProperty("jdk.tls.disabledAlgorithms",
                "SSLv3, RC4, DES, MD5withRSA, DH keySize < 1024, EC keySize < 224, 3DES_EDE_CBC, anon, NULL");
    }

    public static void main(String[] args) {
        SpringApplication.run(NldApplication.class, args);
    }
}
