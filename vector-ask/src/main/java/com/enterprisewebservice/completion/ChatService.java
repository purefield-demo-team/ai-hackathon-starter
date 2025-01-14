package com.enterprisewebservice.completion;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import com.enterprisewebservice.completion.vllm.VllmCompletionClient;
import com.enterprisewebservice.completion.vllm.VllmCompletionRequest;
import com.enterprisewebservice.embeddings.EmbeddingResponse;
import com.enterprisewebservice.embeddings.EmbeddingService;
import com.enterprisewebservice.embeddings.vllm.VLLMEmbeddingService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
public class ChatService {
    @Inject
    ArticleSearchService articleSearchService;
    
    @Inject
    EmbeddingService embeddingService;

    @Inject
    VLLMEmbeddingService vllmEmbeddingService;

    @Inject
    @RestClient
    CompletionClient completionClient;

    @Inject
    @RestClient
    VllmCompletionClient vllmCompletionClient;

    @ConfigProperty(name = "modelname")
    String modelName;

    @ConfigProperty(name = "modeltype")
    String modelType;

    public CompletionResponse ask(QuestionParameters parameters, String query, int topN) throws IOException {
        // Create embeddings for the query
        System.out.println("Generating embeddings for query: " + query);

        EmbeddingResponse embeddingResponse = null;
        
        if (modelType.equals("openai")) {
            embeddingResponse = embeddingService.generateEmbeddings(List.of(query));
        } else {
            embeddingResponse = vllmEmbeddingService.generateEmbeddings(List.of(query));
            
        }

        // Search for related articles
       ArticleSearchResults articles = null;
        try {
            articles = articleSearchService.searchArticles(parameters, embeddingResponse, topN);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        // Generate the message
        StringBuilder message = new StringBuilder();
        message.append("You answer questions about Tasks, Goals and Notes. Use the below information to answer the subsequent question. If the answer cannot be found in the notes, write \"I could not find an answer.\"");
        
        message.append("\n\nNotes:\n\"\"\"\n").append(articles.getMessageSummary()).append("\n\"\"\"");
        
        message.append("\n\nQuestion: ").append(query);

        message.append("\n\nMore Info: The Question above should be answered by giving me extra information about each of the items discussed. Don't just paste the question content back, do some research with the articles I gave you as well as your knowledge and give me a comprehensive response.");
        // Create completion request
        CompletionRequest completionRequest = new CompletionRequest();
        completionRequest.setModel(modelName);
        completionRequest.setMessages(Arrays.asList(
                new Message("system", "You are a helpful assistant."),
                new Message("user", message.toString())
        ));

        CompletionResponse completionResponse = completionClient.createCompletion(completionRequest);
        completionResponse.setArticleSearchResults(articles);
        // Extract and return the completion
        return completionResponse;
    }

    public CompletionResponse askVllm(QuestionParameters parameters, String query, int topN) throws IOException {
        // Generate embeddings for the query
        System.out.println("Generating embeddings for query: " + query);
        EmbeddingResponse embeddingResponse = null;

        if (modelType.equals("openai")) {
            embeddingResponse = embeddingService.generateEmbeddings(List.of(query));
        } else {
            embeddingResponse = vllmEmbeddingService.generateEmbeddings(List.of(query));
            
        }

        // Search for related articles
        ArticleSearchResults articles = null;
        try {
            articles = articleSearchService.searchArticles(parameters, embeddingResponse, topN);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Construct the system message content
        StringBuilder systemContentBuilder = new StringBuilder();
        systemContentBuilder.append("You answer questions about Tasks, Goals and Notes. Use the below information to answer the subsequent question. If the answer cannot be found in the notes, write \"I could not find an answer.\"");

        systemContentBuilder.append("\n\nNotes:\n\"\"\"\n").append(articles.getMessageSummary()).append("\n\"\"\"");

        systemContentBuilder.append("\n\nMore Info: The Question above should be answered by giving me extra information about each of the items discussed. Don't just paste the question content back, do some research with the articles I gave you as well as your knowledge and give me a comprehensive response in Markdown Formatting.");

        String systemContent = systemContentBuilder.toString();

        // Construct the user message content
        String userContent = query;

        // Create the messages list
        List<Message> messages = Arrays.asList(
            new Message("system", systemContent),
            new Message("user", userContent)
        );

        // Create the completion request
        VllmCompletionRequest completionRequest = new VllmCompletionRequest();
        completionRequest.setModel(modelName);  // Or include extra quotes if needed
        completionRequest.setMessages(messages);
        completionRequest.setMaxTokens(4000);
        completionRequest.setTemperature(0.0);

        // Serialize and log the request payload
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        String jsonPayload = null;
        try {
            jsonPayload = objectMapper.writeValueAsString(completionRequest);
            System.out.println("Request Payload:\n" + jsonPayload);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        // Call the completion endpoint
        CompletionResponse completionResponse = null;
        try {
            completionResponse = vllmCompletionClient.createCompletion(jsonPayload);
            completionResponse.setArticleSearchResults(articles);
        } catch (WebApplicationException e) {
            Response response = e.getResponse();
            String errorBody = response.readEntity(String.class);
            System.err.println("Request failed with status code: " + response.getStatus());
            System.err.println("Error body: " + errorBody);
            throw e;
        }

        // Handle the response
        if (completionResponse != null && completionResponse.getChoices() != null && !completionResponse.getChoices().isEmpty()) {
            String assistantResponse = completionResponse.getChoices().get(0).getMessage().getContent();
            System.out.println("Assistant's response: " + assistantResponse);
        } else {
            System.err.println("No response from the assistant or unexpected response format.");
        }

        // Return the response
        return completionResponse;
    }

    public CompletionResponse askVllmForSQL(QuestionParameters parameters, String query, int topN) throws IOException {
        // Generate embeddings for the query
        System.out.println("Generating embeddings for query: " + query);
        EmbeddingResponse embeddingResponse = null;
        if (modelType.equals("openai")) {
            embeddingResponse = embeddingService.generateEmbeddings(List.of(query));
        } else {
            embeddingResponse = vllmEmbeddingService.generateEmbeddings(List.of(query));
            
        }

        // Search for related articles
        ArticleSearchResults articles = null;
        try {
            articles = articleSearchService.searchArticles(parameters, embeddingResponse, topN);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Construct the system message content
        StringBuilder systemContentBuilder = new StringBuilder();
        systemContentBuilder.append("You generate SQL and only SQL with the following structure: <sql>SELECT * FROM public.data_21_24 WHERE product_offereing_group = 'RHEL'</sql>. You must have the open and closing <sql> tags. Use the below information to generate the correct SQL. Don't write out anything else, just give me SQL I can copy and paste.\"");

        systemContentBuilder.append("\n\nNotes:\n\"\"\"\n").append(articles.getMessageSummary()).append("\n\"\"\"");

        systemContentBuilder.append("\n\nMore Info: Give me SQL that can be copied and pasted. Nothing more.Do some research with the articles I gave you as well as your knowledge and give me a pure SQL statement.");
        systemContentBuilder.append("\n\nExample Output: <sql>SELECT * FROM public.data_21_24 WHERE product_offereing_group = 'RHEL'</sql>. Yes insert the beginning and ending <sql> tags").append(query);
        String systemContent = systemContentBuilder.toString();

        // Construct the user message content
        String userContent = query;

        // Create the messages list
        List<Message> messages = Arrays.asList(
            new Message("system", systemContent),
            new Message("user", userContent)
        );

        // Create the completion request
        VllmCompletionRequest completionRequest = new VllmCompletionRequest();
        completionRequest.setModel(modelName);  // Or include extra quotes if needed
        completionRequest.setMessages(messages);
        completionRequest.setMaxTokens(2000);
        completionRequest.setTemperature(0.0);

        // Serialize and log the request payload
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        String jsonPayload = null;
        try {
            jsonPayload = objectMapper.writeValueAsString(completionRequest);
            System.out.println("Request Payload:\n" + jsonPayload);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        // Call the completion endpoint
        CompletionResponse completionResponse = null;
        try {
            completionResponse = vllmCompletionClient.createCompletion(jsonPayload);
            completionResponse.setArticleSearchResults(articles);
        } catch (WebApplicationException e) {
            Response response = e.getResponse();
            String errorBody = response.readEntity(String.class);
            System.err.println("Request failed with status code: " + response.getStatus());
            System.err.println("Error body: " + errorBody);
            throw e;
        }

        // Handle the response
        if (completionResponse != null && completionResponse.getChoices() != null && !completionResponse.getChoices().isEmpty()) {
            String assistantResponse = completionResponse.getChoices().get(0).getMessage().getContent();
            System.out.println("Assistant's response: " + assistantResponse);
        } else {
            System.err.println("No response from the assistant or unexpected response format.");
        }

        // Return the response
        return completionResponse;
    }

    public CompletionResponse askOpenAIForSQL(QuestionParameters parameters, String query, int topN) throws IOException {
        // Generate embeddings for the query
        System.out.println("insid ask open ai for sql");
        System.out.println("Generating embeddings for query: " + query);
        EmbeddingResponse embeddingResponse = null;
        if (modelType.equals("openai")) {
            embeddingResponse = embeddingService.generateEmbeddings(List.of(query));
        } else {
            embeddingResponse = vllmEmbeddingService.generateEmbeddings(List.of(query));
            
        }

        // Search for related articles
        ArticleSearchResults articles = null;
        try {
            articles = articleSearchService.searchArticles(parameters, embeddingResponse, topN);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Construct the system message content
        StringBuilder systemContentBuilder = new StringBuilder();
        systemContentBuilder.append("You generate SQL and only SQL with the following structure: <sql>SELECT * FROM public.data_21_24 WHERE product_offereing_group = 'RHEL'</sql>. You must have the open and closing <sql> tags. Use the below information to generate the correct SQL. Don't write out anything else, just give me SQL I can copy and paste.\"");

        systemContentBuilder.append("\n\nNotes:\n\"\"\"\n").append(articles.getMessageSummary()).append("\n\"\"\"");

        systemContentBuilder.append("\n\nMore Info: Give me SQL that can be copied and pasted. Nothing more.Do some research with the articles I gave you as well as your knowledge and give me a pure SQL statement.");
        systemContentBuilder.append("\n\nExample Output: <sql>SELECT * FROM public.data_21_24 WHERE product_offereing_group = 'RHEL'</sql>. Yes insert the beginning and ending <sql> tags").append(query);
        String systemContent = systemContentBuilder.toString();

        // Construct the user message content
        String userContent = query;

        // Create the messages list
        List<Message> messages = Arrays.asList(
            new Message("system", systemContent),
            new Message("user", userContent)
        );

        // Create the completion request
        CompletionRequest completionRequest = new CompletionRequest();
        completionRequest.setModel("gpt-4");  // Or include extra quotes if needed
        completionRequest.setMessages(messages);

        // Serialize and log the request payload
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        String jsonPayload = null;
        try {
            jsonPayload = objectMapper.writeValueAsString(completionRequest);
            System.out.println("Request Payload:\n" + jsonPayload);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        // Call the completion endpoint
        CompletionResponse completionResponse = null;
        try {
            completionResponse = completionClient.createCompletion(completionRequest);
            completionResponse.setArticleSearchResults(articles);
        } catch (WebApplicationException e) {
            Response response = e.getResponse();
            String errorBody = response.readEntity(String.class);
            System.err.println("Request failed with status code: " + response.getStatus());
            System.err.println("Error body: " + errorBody);
            throw e;
        }

        // Handle the response
        if (completionResponse != null && completionResponse.getChoices() != null && !completionResponse.getChoices().isEmpty()) {
            String assistantResponse = completionResponse.getChoices().get(0).getMessage().getContent();
            System.out.println("Assistant's response: " + assistantResponse);
        } else {
            System.err.println("No response from the assistant or unexpected response format.");
        }

        // Return the response
        return completionResponse;
    }


}
