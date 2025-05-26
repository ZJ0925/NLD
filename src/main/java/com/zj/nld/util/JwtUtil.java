package com.zj.nld.util;

import java.util.Date;
import io.jsonwebtoken.Jwts; // 用於建立與解析 JWT
import io.jsonwebtoken.SignatureAlgorithm; // 指定簽章演算法
import io.jsonwebtoken.Claims; // 用來取得 JWT 的 payload 資料

public class JwtUtil {

    private static final String SECRET_KEY = "my-secret-key";//JWT金鑰
    private static final long EXPIRATION_TIME = 3600000; // 時效性(ms/毫秒)

    // ✅ 產生 JWT Token，會將 groupId 放入 Token 的 Payload 中
    public static String generateToken(String groupId) {
        return Jwts.builder()
                .setSubject("form-access") // 設定主題，用來辨識這個 token 的用途
                .claim("groupId", groupId) // 自訂欄位，存入使用者的群組 ID
                .setIssuedAt(new Date()) // 簽發時間（現在）
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 過期時間（現在 + 一小時）
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // 使用 HS256 和密鑰進行簽名
                .compact(); // 產生並回傳最終的 JWT 字串
    }

    // ✅ 從 Token 中解析出 groupId（如果合法）
    public static String getGroupIdFromToken(String token) {
        Claims claims = Jwts.parser() // 建立 JWT 解析器
                .setSigningKey(SECRET_KEY) // 設定密鑰來驗證簽名
                .parseClaimsJws(token) // 解析 JWT 字串
                .getBody(); // 取得 Payload 的內容（Claims）
        return claims.get("groupId", String.class); // 從 payload 中取得 groupId 欄位
    }

    // ✅ 驗證 Token 是否有效（沒有過期、沒有被竄改）
    public static boolean validateToken(String token) {
        try {
            // 嘗試解析並驗證簽名，成功就代表合法
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            // 任一錯誤（如過期、格式錯誤）都視為驗證失敗
            return false;
        }
    }
}
