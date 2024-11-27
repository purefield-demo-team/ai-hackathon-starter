package com.enterprisewebservice.database;

public class SqlUtil {
    public static String stripSqlTags(String input) {
        if (input == null) return null;
        return input.replace("<sql>", "").replace("</sql>", "");
    }
    
}
