package com.zj.nld.Service.impl;

import com.zj.nld.Service.LineVerificationService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;  // 改這裡：用 Spring 的 HttpHeaders
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class LineVerificationServiceImpl implements LineVerificationService {

    /**
     * 驗證 LIFF Access Token 並取得真實的 User ID
     * 呼叫 LINE API，無法偽造
     */
    @Override
    public String verifyAccessTokenAndGetUserId(String accessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 呼叫 LINE Profile API
            String url = "https://api.line.me/v2/profile";
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> profile = response.getBody();
                String userId = (String) profile.get("userId");

                System.out.println("Access Token 驗證成功，User ID: " + userId);
                return userId;
            }

            return null;

        } catch (Exception e) {
            System.err.println("Access Token 驗證失敗: " + e.getMessage());
            return null;
        }
    }
}