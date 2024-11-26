package com.enterprisewebservice.database;

import java.math.BigDecimal;

public class CustomerSales {
    public String accountName;
    public BigDecimal totalSales;

    public CustomerSales() {
    }

    public CustomerSales(String accountName, BigDecimal totalSales) {
        this.accountName = accountName;
        this.totalSales = totalSales;
    }
}
