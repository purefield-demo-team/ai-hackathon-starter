package com.enterprisewebservice.database;

import java.util.List;

import io.quarkus.qute.Template;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class CustomerSalesResource {

    @Inject
    Template customersales; // Inject the Qute template

    public String getCustomerSalesHtml(List<CustomerSales> customerSalesList) {
        // Fetch or create your list of CustomerSales
        // Render the template with your data
         // Render the template to a String
         String htmlString = customersales.data("customerSalesList", customerSalesList).render();

        return htmlString;
    }

    
}
