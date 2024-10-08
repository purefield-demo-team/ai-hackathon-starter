package com.enterprisewebservice.completion;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;

import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;
import org.eclipse.microprofile.config.ConfigProvider;


@ApplicationScoped
@RegisterRestClient(configKey="openai.api")
public interface OpenAICompletionClient {

    @POST
    @Path("/chat/completions")
    @ClientHeaderParam(name="Authorization", value="{generateAuthHeader}")
    CompletionResponse createCompletion(CompletionRequest request);

    default String generateAuthHeader() {
        String openaikey = ConfigProvider.getConfig().getValue("openaikey", String.class);
        return "Bearer " + openaikey;
    }

}

