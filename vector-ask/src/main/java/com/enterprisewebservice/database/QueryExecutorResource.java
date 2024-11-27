package com.enterprisewebservice.database;
import jakarta.inject.Inject;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.GET;

import javax.sql.DataSource;
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

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            while (resultSet.next()) {
                String accountName = resultSet.getString("account_name");
                BigDecimal totalSales = resultSet.getBigDecimal("total_sales");
                results.add(new CustomerSales(accountName, totalSales));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return results;
    }

}

