package com.enterprisewebservice.api;

import com.enterprisewebservice.model.ErrorResponse;
import com.enterprisewebservice.model.Note;
import com.enterprisewebservice.model.TaskNote;
import com.enterprisewebservice.model.datasource.TaskDataSource;
import com.enterprisewebservice.model.StrapiServiceResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.IOException;
import java.util.List;

@ApplicationScoped
public class TaskDataSourceService {

    @Inject
    ApiClient apiClient;

    private final ObjectMapper objectMapper = new ObjectMapper(); // replace with your actual JSON library


    public StrapiServiceResponse<List<TaskDataSource>> getByTaskId(String id) throws IOException {
        if (id == null || id.isEmpty()) {
            return new StrapiServiceResponse<>(null, new ErrorResponse(400, "Bad Request", "Task ID is undefined"));
        }

        String response = null;
        try {
            response = apiClient.get("/task-data-sources?populate[0]=task&populate[1]=dataSource&filters[task][id][$eq]=" + id);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return objectMapper.readValue(response, objectMapper.getTypeFactory().constructParametricType(StrapiServiceResponse.class, objectMapper.getTypeFactory().constructCollectionType(List.class, TaskDataSource.class)));
    }
   
}
