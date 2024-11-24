package com.enterprisewebservice.api;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.GET;
import java.util.List;
import java.io.IOException;
import java.util.ArrayList;
import com.enterprisewebservice.api.NoteService;
import com.enterprisewebservice.model.StrapiServiceResponse;
import com.enterprisewebservice.model.Task;
import com.enterprisewebservice.embeddings.EmbeddingService;
import com.enterprisewebservice.model.Note;
import com.enterprisewebservice.embeddings.EmbeddingResponse;
import com.enterprisewebservice.embeddings.ChunkingService;
import com.enterprisewebservice.completion.ChatService;
import com.enterprisewebservice.completion.CompletionResponse;
import com.enterprisewebservice.completion.QuestionParameters;
import com.enterprisewebservice.RedisSearchIndexer;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.enterprisewebservice.completion.vllm.*;

@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TaskResource {

    @Inject
    TaskService taskService;

    @Inject
    ChatService chatService;

    @ConfigProperty(name = "llmmodel")
    String llmModel;

    @GET
    @Path("/ask/{id}/question")
    public Response askQuestion(@PathParam("id") Integer id, @QueryParam("keycloakSubject") String keycloakSubject) {
        try {
            StrapiServiceResponse<Task> result = taskService.getTask(id);
            String query = "Can you help me complete the following task with name: " 
                + (result.getData() != null && result.getData().getTitle() != null ? result.getData().getTitle() : "") 
                + " and description: " 
                + (result.getData() != null && result.getData().getDescription() != null ? result.getData().getDescription() : "");
            Long taskId = id.longValue();
            List<Long> taskIds = new ArrayList<>();
            taskIds.add(taskId);
            QuestionParameters parameters = new QuestionParameters();
            parameters.setSubject(keycloakSubject);
            parameters.setTaskIds(taskIds);
            CompletionResponse answer = null;
            if(llmModel.equals("llama3"))
            {
                answer = chatService.askVllm(parameters, query, 3);
            }
            else
            {
                answer = chatService.ask(parameters, query, 3);
            }

            

            return Response.ok(answer.getChoices().get(0).getMessage().getContent()).build();

        } catch (IOException e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }
}

