package com.enterprisewebservice.embeddings.vllm;

import java.util.List;

import org.eclipse.microprofile.rest.client.inject.RestClient;

import com.enterprisewebservice.embeddings.EmbeddingRequest;
import com.enterprisewebservice.embeddings.EmbeddingResponse;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class VLLMEmbeddingService {

    @Inject
    @RestClient
    VLLMEmbeddingClient vllmEmbeddingClient;

    public EmbeddingResponse generateEmbeddings(List<String> texts) {
        EmbeddingRequest request = new EmbeddingRequest();
        request.setModel("e5-mistral-7b-instruct");
        request.setInput(texts);

        System.out.println("Sending these texts for embedding to vLLM: " + request.getInput());

        // Directly call the endpoint without adding any headers.
        EmbeddingResponse response = vllmEmbeddingClient.createEmbedding(request);
        
        // Handle the response as needed.
        return response;
    }
}
