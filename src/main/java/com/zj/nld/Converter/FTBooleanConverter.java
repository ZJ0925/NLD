package com.zj.nld.Converter;


import jakarta.persistence.AttributeConverter; // JPA 的介面，定義如何在 DB 與 Java 之間轉換
import jakarta.persistence.Converter;         // JPA 的註解，用來標記這是一個 Converter

// 宣告這是一個 Converter，autoApply=false 代表「不會自動套用在所有 Boolean 欄位」
// 需要轉換的欄位必須手動加上 @Convert(converter = FTBooleanConverter.class)
@Converter(autoApply = false)
public class FTBooleanConverter implements AttributeConverter<Boolean, String> {
    // 繼承 AttributeConverter，泛型 <Java 型別, DB 型別>
    // Boolean = Java 的型別，String = 資料庫的型別

    // 把 Java 的 Boolean 轉成 DB 欄位要存的 String
    @Override
    public String convertToDatabaseColumn(Boolean attribute) {
        if (attribute == null) return null;   // 如果是 null，就直接存 null
        return attribute ? "N" : "F";         // true 存 "T"，false 存 "F"
    }

    @Override
    public Boolean convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;                 // 如果是 null，就回傳 null
        return "T".equalsIgnoreCase(dbData);             // 只有字串等於 "T" → true，其他 ("F" 或 "N") → false
    }
}
