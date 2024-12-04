package com.enterprisewebservice.database;

import java.util.HashMap;
import java.util.Map;
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
         // Compute flags
        boolean showAccountName = customerSalesList.stream()
            .anyMatch(cs -> cs.getAccountName() != null);

        boolean showTotalSales = customerSalesList.stream()
            .anyMatch(cs -> cs.getTotalSalesFormatted() != null);

        boolean showTitle = customerSalesList.stream()
            .anyMatch(cs -> cs.getTitle() != null);

        // Prepare data for the template
        Map<String, Object> templateData = new HashMap();
        templateData.put("customerSalesList", customerSalesList);
        templateData.put("showAccountName", showAccountName);
        templateData.put("showTotalSales", showTotalSales);
        templateData.put("showTitle", showTitle);
         String htmlString = customersales.data(templateData).render();

        return htmlString;
    }

    
}
