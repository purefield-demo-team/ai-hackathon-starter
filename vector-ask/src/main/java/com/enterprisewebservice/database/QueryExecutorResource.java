package com.enterprisewebservice.database;
i
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
    public List<CustomerSales> executeQuery() {
        String sql = "SELECT account_name, SUM(grand_total) AS total_sales " +
                     "FROM public.data_21_24 " +
                     "WHERE product_offering_group = 'RHEL' " +
                     "  AND account_name NOT IN ( " +
                     "    SELECT DISTINCT account_name " +
                     "    FROM public.data_21_24 " +
                     "    WHERE product_offering_group = 'Ansible' " +
                     "  ) " +
                     "GROUP BY account_name " +
                     "ORDER BY total_sales DESC " +
                     "LIMIT 5;";

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

    public static class CustomerSales {
        public String accountName;
        public BigDecimal totalSales;

        public CustomerSales() {
        }

        public CustomerSales(String accountName, BigDecimal totalSales) {
            this.accountName = accountName;
            this.totalSales = totalSales;
        }
    }
}

