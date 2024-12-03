package com.enterprisewebservice.database;

import java.math.BigDecimal;

public class CustomerSales {
    public String accountName;
    public BigDecimal grandTotal;
    public String title;
    public String totalSalesFormatted;

    public CustomerSales() {
    }

    public CustomerSales(String accountName, BigDecimal grandTotal, String title, String totalSalesFormatted) {
        this.accountName = accountName;
        this.grandTotal = grandTotal;
        this.totalSalesFormatted = totalSalesFormatted;
        this.title = title;
    }
}
