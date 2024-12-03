package com.enterprisewebservice.database;
import jakarta.inject.Inject;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.GET;

import javax.sql.DataSource;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.enterprisewebservice.model.datasource.RagDataSource;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Path("/execute")
public class QueryExecutorResource {

    @Inject
    DataSource dataSource;

    @ConfigProperty(name = "JDBC_URL")
    String jdbcUrl;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<CustomerSales> executeQuery(String sql) {
        System.out.println("The JDBC URL is: " + jdbcUrl);
        List<CustomerSales> results = new ArrayList<>();
        System.out.println("The Query is: " + sql);
        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

                while (resultSet.next()) {
                    String accountName = null;
                    String grandTotalStr = null;
                    String title = null;
                    String totalSalesFormatted = null;
                    String grandTotalCleaned = null;
                    BigDecimal totalSales = null;
                    try{
                        accountName = resultSet.getString("account_name");
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                    try{
                        grandTotalStr = resultSet.getString("grand_total");
                         // Keep the formatted money string
                        totalSalesFormatted = grandTotalStr;
                
                        // Remove currency symbols and commas
                        grandTotalCleaned = grandTotalStr.replaceAll("[^\\d.-]", "");
                
                        // Parse the cleaned string into BigDecimal
                        totalSales = new BigDecimal(grandTotalCleaned);
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                    try{
                        title = resultSet.getString("title");
                        System.out.println("Adding title: " + title);
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                    System.out.println("Adding a new CustomerSales object");
                    results.add(new CustomerSales(accountName, totalSales, title, totalSalesFormatted));
                }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return results;
    }

}

