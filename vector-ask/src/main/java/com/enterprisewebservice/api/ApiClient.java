package com.enterprisewebservice.api;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.MediaType;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class ApiClient {

    @ConfigProperty(name = "strapihost")
    String strapiHost;

    @ConfigProperty(name = "strapitoken")
    String strapiToken;
    
    private final HttpClient client;
    private final ObjectMapper objectMapper;

    @Inject
    public ApiClient(HttpClient client, ObjectMapper objectMapper) {
        this.client = client;
        this.objectMapper = objectMapper;
    }

    public String get(String path) throws Exception {
        System.out.println("strapiHost: " + strapiHost);
      
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(strapiHost + "/api" + path))
                .header("Authorization", lookupBearerToken())
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new Exception("HTTP error code : " + response.statusCode());
        }
        return response.body();
    }

    // Implement POST, PUT, DELETE if necessary

   public String post(String path, Object object) throws Exception {
        
        JsonNode jsonNode = objectMapper.valueToTree(object);
        ((ObjectNode) jsonNode).remove("id");
        Map<String, JsonNode> dataObject = new HashMap<>();
        dataObject.put("data", jsonNode);
       
        String jsonString = objectMapper.writeValueAsString(dataObject);
        System.out.println("jsonString: " + jsonString);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(strapiHost + "/api" + path))
                .header("Authorization", lookupBearerToken())
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .POST(HttpRequest.BodyPublishers.ofString(jsonString))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.out.println("HTTP error code : " + response.toString());
            throw new Exception("HTTP error code : " + response.statusCode());
        }
        return response.body();
    }

    public String delete(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(strapiHost + "/api" + path))
                .header("Authorization", lookupBearerToken())
                .DELETE()
                .build();
    
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
    
        if (response.statusCode() != 200) {
            throw new Exception("HTTP error code : " + response.statusCode());
        }
        return response.body();
    }
    

    private String lookupBearerToken() {
        return "Bearer " + strapiToken;
    }
}
