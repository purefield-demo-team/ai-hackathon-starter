package com.enterprisewebservice.embeddings.vllm;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import com.enterprisewebservice.embeddings.EmbeddingRequest;
import com.enterprisewebservice.embeddings.EmbeddingResponse;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;

@ApplicationScoped
@RegisterRestClient(configKey="vllm.api")
public interface VLLMEmbeddingClient {

    @POST
    @Path("/v1/embeddings")
    EmbeddingResponse createEmbedding(EmbeddingRequest request);
}
