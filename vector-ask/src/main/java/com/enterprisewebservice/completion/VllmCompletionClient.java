package com.enterprisewebservice.completion;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;

import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;
import org.eclipse.microprofile.config.ConfigProvider;


@ApplicationScoped
@RegisterRestClient(configKey="vllm.api")
public interface VllmCompletionClient {

    @POST
    @Path("/chat/completions")

    CompletionResponse createCompletion(CompletionRequest request);

}

