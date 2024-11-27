package com.enterprisewebservice.database;

public class SqlUtil {
    public static String stripSqlTags(String input) {
        return input.replaceAll("^<sql>(.*?)</sql>$", "$1");
    }
    
}
