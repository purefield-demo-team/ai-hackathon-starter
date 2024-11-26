package com.enterprisewebservice.api;

import com.enterprisewebservice.completion.ChatService;
import com.enterprisewebservice.completion.CompletionResponse;
import com.enterprisewebservice.completion.QuestionParameters;
import com.enterprisewebservice.model.ErrorResponse;
import com.enterprisewebservice.model.Task;
import com.enterprisewebservice.model.StrapiServiceResponse;
import com.enterprisewebservice.model.Tag;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.enterprisewebservice.completion.vllm.*;

@ApplicationScoped
public class TaskService {

    @Inject
    ApiClient apiClient;

    @Inject
    ChatService chatService;

    @ConfigProperty(name = "llmmodel")
    String llmModel;
    
    private final ObjectMapper objectMapper = new ObjectMapper(); // replace with your actual JSON library

    public StrapiServiceResponse<List<Task>> getAll(String keycloakSubject) throws IOException {
        if (keycloakSubject == null || keycloakSubject.isEmpty()) {
            return new StrapiServiceResponse<>(null, new ErrorResponse(400, "Bad Request", "Goal ID is undefined"));
        }
        String response = null;
        try {
            response = apiClient.get("/tasks?filters[userProfile][keycloaksubject][$eq]=" + keycloakSubject);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return objectMapper.readValue(response, objectMapper.getTypeFactory().constructParametricType(StrapiServiceResponse.class, objectMapper.getTypeFactory().constructCollectionType(List.class, Task.class)));

    }

    public StrapiServiceResponse<Task> getTask(Integer id) throws IOException {
        if (id == null) {
            return new StrapiServiceResponse<>(null, new ErrorResponse(400, "Bad Request", "Note ID is undefined"));
        }
        String response = null;
        try {
            response = apiClient.get("/tasks/"+id+"?populate[0]=tags&populate[1]=userProfile");
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return objectMapper.readValue(response, new TypeReference<StrapiServiceResponse<Task>>() {});

    }

    public StrapiServiceResponse<List<Task>> getByTags(List<Tag> tags, String keycloakSubject) throws IOException {
        if (tags == null || tags.isEmpty()) {
            return new StrapiServiceResponse<>(null, new ErrorResponse(400, "Bad Request", "Tags are undefined"));
        }
        StringBuilder tagFilters = new StringBuilder();
        for (Tag tag : tags) {
            tagFilters.append("filters[tags][id][$in]=").append(tag.getId()).append("&");
        }
        tagFilters.deleteCharAt(tagFilters.length() - 1); // Remove the last "&"
        String response = null;
        try {
            response = apiClient.get("/notes?filters[userProfile][keycloaksubject][$eq]=" + keycloakSubject + "&" + tagFilters.toString());
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return objectMapper.readValue(response, objectMapper.getTypeFactory().constructParametricType(StrapiServiceResponse.class, objectMapper.getTypeFactory().constructCollectionType(List.class, Task.class)));

    }

    public static boolean containsSqlAsWord(String input) {
        // Regex to match 'SQL' as a standalone word, case-insensitively
        String regex = "\\b(?i)sql\\b";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(input);
        return matcher.find();
    }

    public CompletionResponse askQuestion(Integer id, String keycloakSubject) throws IOException {
        StrapiServiceResponse<Task> result = getTask(id);
        String query = "Can you help me complete the following task with name: " 
            + (result.getData() != null && result.getData().getTitle() != null ? result.getData().getTitle() : "") 
            + " and description: " 
            + (result.getData() != null && result.getData().getDescription() != null ? result.getData().getDescription() : "");

        CompletionResponse answer = null;
        Long taskId = id.longValue();
        List<Long> taskIds = new ArrayList<>();
        taskIds.add(taskId);
        QuestionParameters parameters = new QuestionParameters();
        parameters.setSubject(keycloakSubject);
        parameters.setTaskIds(taskIds);
        
        if(containsSqlAsWord(query))
        {
            answer = chatService.ask(parameters, query, 3);
        }
        else if(llmModel.equals("llama3"))
        {
            answer = chatService.askVllm(parameters, query, 3);
        }
        else if(llmModel.equals("openai"))
        {
            answer = chatService.ask(parameters, query, 3);
        }
        else if(llmModel.equals("sql"))
        {
            answer = chatService.askVllmForSQL(parameters, query, 3);
        }
        else if(llmModel.equals("openaisql"))
        {
            answer = chatService.askOpenAIForSQL(parameters, query, 0);
        }
        return answer;
    }

    // Note: For methods requiring POST, PUT and DELETE, you will have to implement similar methods in ApiClient and use them here.
}
