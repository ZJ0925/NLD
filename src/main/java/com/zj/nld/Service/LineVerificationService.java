package com.zj.nld.Service;

public interface LineVerificationService {

    /**
     * 驗證 LIFF Access Token 並取得真實的 User ID
     * 呼叫 LINE API，無法偽造
     */
    String verifyAccessTokenAndGetUserId(String accessToken);
}
