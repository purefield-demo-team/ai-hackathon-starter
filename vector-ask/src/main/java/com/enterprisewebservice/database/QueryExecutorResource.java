package com.enterprisewebservice.database;
import jakarta.inject.Inject;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.GET;

import javax.sql.DataSource;

import com.enterprisewebservice.model.datasource.RagDataSource;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Path("/execute")
public class QueryExecutorResource {

    @Inject
    DataSource dataSource;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<CustomerSales> executeQuery(String sql) {

        List<CustomerSales> results = new ArrayList<>();
        System.out.println("The Query is: " + sql);
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

                while (resultSet.next()) {
                    String accountName = resultSet.getString("account_name");
                    String grandTotalStr = resultSet.getString("grand_total");
                
                    // Keep the formatted money string
                    String totalSalesFormatted = grandTotalStr;
                
                    // Remove currency symbols and commas
                    String grandTotalCleaned = grandTotalStr.replaceAll("[^\\d.-]", "");
                
                    // Parse the cleaned string into BigDecimal
                    BigDecimal totalSales = new BigDecimal(grandTotalCleaned);
                
                    results.add(new CustomerSales(accountName, totalSales, totalSalesFormatted));
                }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return results;
    }

}

