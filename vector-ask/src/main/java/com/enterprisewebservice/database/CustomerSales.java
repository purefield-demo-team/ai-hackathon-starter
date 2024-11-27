package com.enterprisewebservice.database;

import java.math.BigDecimal;

public class CustomerSales {
    public String accountName;
    public BigDecimal grandTotal;
    public String totalSalesFormatted;

    public CustomerSales() {
    }

    public CustomerSales(String accountName, BigDecimal grandTotal, String totalSalesFormatted) {
        this.accountName = accountName;
        this.grandTotal = grandTotal;
        this.totalSalesFormatted = totalSalesFormatted;
    }
}
