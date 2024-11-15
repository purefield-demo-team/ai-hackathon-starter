package com.enterprisewebservice.completion;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.MultivaluedHashMap;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.apache.http.impl.client.HttpClients;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.ws.rs.WebApplicationException;

import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import com.enterprisewebservice.embeddings.EmbeddingResponse;
import com.enterprisewebservice.embeddings.EmbeddingService;
import com.enterprisewebservice.model.Task;
import com.enterprisewebservice.completion.CompletionRequest;

import com.enterprisewebservice.completion.vllm.*;

@ApplicationScoped
public class ChatService {
    @Inject
    ArticleSearchService articleSearchService;
    
    @Inject
    EmbeddingService embeddingService;

    @Inject
    @RestClient
    CompletionClient completionClient;

    @Inject
    @RestClient
    VllmCompletionClient vllmCompletionClient;


    public CompletionResponse ask(String keycloakSubject, String query, int topN) throws IOException {
        // Create embeddings for the query
        System.out.println("Generating embeddings for query: " + query);
        EmbeddingResponse embeddingResponse = embeddingService.generateEmbeddings(List.of(query));

        // Search for related articles
       String articles = null;
        try {
            articles = articleSearchService.searchArticles(keycloakSubject, embeddingResponse, topN);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        // Generate the message
        StringBuilder message = new StringBuilder();
        message.append("You answer questions about Tasks, Goals and Notes. Use the below information to answer the subsequent question. If the answer cannot be found in the notes, write \"I could not find an answer.\"");
        
        message.append("\n\nNotes:\n\"\"\"\n").append(articles).append("\n\"\"\"");
        
        message.append("\n\nQuestion: ").append(query);

        message.append("\n\nMore Info: The Question above should be answered by giving me extra information about each of the items discussed. Don't just paste the question content back, do some research with the articles I gave you as well as your knowledge and give me a comprehensive response.");
        // Create completion request
        CompletionRequest completionRequest = new CompletionRequest();
        completionRequest.setModel("gpt-4");
        completionRequest.setMessages(Arrays.asList(
                new Message("system", "You are a helpful assistant."),
                new Message("user", message.toString())
        ));

        CompletionResponse completionResponse = completionClient.createCompletion(completionRequest);

        // Extract and return the completion
        return completionResponse;
    }

    // public CompletionResponse askVllm(String keycloakSubject, String query, int topN) throws IOException {
    //     // Generate embeddings for the query
    //     System.out.println("Generating embeddings for query: " + query);
    //     EmbeddingResponse embeddingResponse = embeddingService.generateEmbeddings(List.of(query));

    //     // Search for related articles
    //     String articles = null;
    //     try {
    //         articles = articleSearchService.searchArticles(keycloakSubject, embeddingResponse, topN);
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //     }

    //     if (articles == null || articles.isEmpty()) {
    //         articles = "No relevant articles found.";
    //     }

    //     // Construct the system message content
    //     StringBuilder systemContentBuilder = new StringBuilder();
    //     systemContentBuilder.append("You answer questions about Tasks, Goals and Notes. Use the below information to answer the subsequent question. If the answer cannot be found in the notes, write \"I could not find an answer.\"");

    //     systemContentBuilder.append("\n\nNotes:\n\"\"\"\n").append(articles).append("\n\"\"\"");

    //     systemContentBuilder.append("\n\nMore Info: The Question above should be answered by giving me extra information about each of the items discussed. Don't just paste the question content back, do some research with the articles I gave you as well as your knowledge and give me a comprehensive response.");

    //     String systemContent = systemContentBuilder.toString();

    //     // Construct the user message content
    //     String userContent = query;

    //     // Create the messages list
    //     List<Message> messages = Arrays.asList(
    //         new Message("system", systemContent),
    //         new Message("user", userContent)
    //     );

    //     // Create the completion request
    //     VllmCompletionRequest completionRequest = new VllmCompletionRequest();
    //     completionRequest.setModel("Meta-Llama-31-8B");
    //     completionRequest.setMessages(messages);
    //     completionRequest.setMaxTokens(2000);
    //     completionRequest.setTemperature(0.0);

    //     // Serialize and log the request payload
    //     ObjectMapper objectMapper = new ObjectMapper();
    //     String jsonPayload = null;
    //     try {
    //         jsonPayload = objectMapper.writeValueAsString(completionRequest);
    //         System.out.println("Request Payload: " + jsonPayload);
    //     } catch (JsonProcessingException e) {
    //         e.printStackTrace();
    //     }

    //     // Call the completion endpoint
    //     CompletionResponse completionResponse = vllmCompletionClient.createCompletion(jsonPayload);

    //     // Handle the response
    //     if (completionResponse != null && completionResponse.getChoices() != null && !completionResponse.getChoices().isEmpty()) {
    //         String assistantResponse = completionResponse.getChoices().get(0).getMessage().getContent();
    //         System.out.println("Assistant's response: " + assistantResponse);
    //     } else {
    //         System.err.println("No response from the assistant or unexpected response format.");
    //     }

    //     // Return the response
    //     return completionResponse;
    // }

    public CompletionResponse askVllm(String keycloakSubject, String query, int topN) throws IOException {
        // Generate embeddings for the query
        System.out.println("Generating embeddings for query: " + query);
        EmbeddingResponse embeddingResponse = embeddingService.generateEmbeddings(List.of(query));

        // Search for related articles
        String articles = null;
        try {
            articles = articleSearchService.searchArticles(keycloakSubject, embeddingResponse, topN);
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (articles == null || articles.isEmpty()) {
            articles = "No relevant articles found.";
        }

        // Construct the system message content
        StringBuilder systemContentBuilder = new StringBuilder();
        systemContentBuilder.append("You answer questions about Tasks, Goals and Notes. Use the below information to answer the subsequent question. If the answer cannot be found in the notes, write \"I could not find an answer.\"");

        systemContentBuilder.append("\n\nNotes:\n\"\"\"\n").append(articles).append("\n\"\"\"");

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
        completionRequest.setModel("meta-llama-31-8b-instruct");  // Or include extra quotes if needed
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
