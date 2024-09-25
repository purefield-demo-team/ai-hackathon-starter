package com.enterprisewebservice.completion.vllm;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;
import org.eclipse.microprofile.config.ConfigProvider;

import com.enterprisewebservice.completion.CompletionResponse;


@ApplicationScoped
@RegisterRestClient(configKey="vllm.api")
public interface VllmCompletionClient {

    @POST
    @Path("/chat/completions")
    @Consumes(MediaType.APPLICATION_JSON)
    @ClientHeaderParam(name = "Content-Type", value = "application/json")
    CompletionResponse createCompletion(String jsonPayload);

}

