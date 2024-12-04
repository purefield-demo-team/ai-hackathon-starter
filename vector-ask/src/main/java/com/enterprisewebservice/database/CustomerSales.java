package com.enterprisewebservice.database;

import java.math.BigDecimal;

public class CustomerSales {
    public String accountName;
    public BigDecimal grandTotal;
    public String title;
    public String totalSalesFormatted;

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTotalSalesFormatted() {
        return totalSalesFormatted;
    }

    public void setTotalSalesFormatted(String totalSalesFormatted) {
        this.totalSalesFormatted = totalSalesFormatted;
    }

    public CustomerSales() {
    }

    public CustomerSales(String accountName, BigDecimal grandTotal, String title, String totalSalesFormatted) {
        this.accountName = accountName;
        this.grandTotal = grandTotal;
        this.totalSalesFormatted = totalSalesFormatted;
        this.title = title;
    }
}
