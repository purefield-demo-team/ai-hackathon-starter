package com.enterprisewebservice.database;

import java.math.BigDecimal;

public class CustomerSales {
    public String accountName;
    public BigDecimal grandTotal;

    public CustomerSales() {
    }

    public CustomerSales(String accountName, BigDecimal grandTotal) {
        this.accountName = accountName;
        this.grandTotal = grandTotal;
    }
}
