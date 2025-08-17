package com.zj.nld.Service;

import io.jsonwebtoken.Claims;


public interface JwtService {

    // 使用者觸發查詢，呼叫此方法建立 token
    String generateToken(String lineId, String groupId, Integer roleId);

    // 驗證 JWT，解析出 Claims（Payload 內容）
    Claims parseToken(String token);

    //  從已驗證的 Token 中提取資訊
    boolean isTokenValid(String token);


    // Admin觸發查詢，呼叫此方法建立 token
    String generateAdminToken(String lineId, String groupId, Integer roleId);
}
