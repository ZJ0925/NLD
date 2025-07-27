package com.zj.nld.Service.impl;

import com.zj.nld.Service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.List;


//用JWT建立暫時的NLD訪問
@Service
public class JwtServiceImpl implements JwtService {

    //1.長度為 32 的 byte[] 陣列總共有256bits
    private static final byte[] bytes = new byte[32];

    //2.建立一個加密級別的亂數產生器
    static {
        new SecureRandom().nextBytes(bytes);
    }

    // 3.JWT 密鑰（至少 256-bit 長度，BASE64編碼的密鑰）
    private static final String SECRET_KEY = Base64.getEncoder().encodeToString(bytes);


    // 4.設定 token 的有效期限（30 分鐘）
    private static final long EXPIRATION_MILLIS = 1000 * 60 * 30;

    // 5.使用 JJWT 的工具生成簽章用的 HMAC SHA 金鑰
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // 6.使用者觸發查詢，呼叫此方法建立 token
    public String generateToken(String lineId, String groupId, Integer roleId) {
        return Jwts.builder()
                .setSubject("NLD-Access") // 7.設定 token 主題
                .claim("lineId", lineId)  // 8.加入自定義欄位：LINE ID
                .claim("groupId", groupId) // 9.加入自定義欄位：群組 ID
                .claim("roleId", roleId)
                .setIssuedAt(new Date()) // 11.設定 token 發出時間
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MILLIS)) // 12.設定 token 過期時間
                .signWith(key, SignatureAlgorithm.HS256) // 13.使用密鑰和演算法簽名
                .compact(); // 14.最後產出 JWT 字串
    }


    // 15.解析出 Claims（Payload 內容）
    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key) // 設定驗證用的金鑰
                .build()
                .parseClaimsJws(token) // 開始解析與驗證
                .getBody(); // 回傳 payload 的內容（Claims）
    }

    // 驗證資訊
    public boolean isTokenValid(String token) {
        try {
            parseToken(token); // 嘗試解析 token
            return true; // 沒拋出例外就代表合法
        } catch (JwtException | IllegalArgumentException e) {
            return false; // 被篡改或過期
        }
    }

    /**
     * 快速取得 token 裡的 lineId（可選工具函數）
     */
    public String getLineId(String token) {
        return parseToken(token).get("lineId", String.class);
    }

    /**
     * ✅ 快速取得 token 裡的欄位清單（可選工具函數）
     */
    public List<String> getFields(String token) {
        return parseToken(token).get("fields", List.class);
    }
}
