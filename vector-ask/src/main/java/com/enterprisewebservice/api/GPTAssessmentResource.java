package com.enterprisewebservice.api;

import java.util.ArrayList;
import java.util.List;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.enterprisewebservice.RedisSearchIndexer;
import com.enterprisewebservice.embeddings.ChunkingService;
import com.enterprisewebservice.embeddings.EmbeddingResponse;
import com.enterprisewebservice.embeddings.EmbeddingService;
import com.enterprisewebservice.embeddings.vllm.VLLMEmbeddingService;
import com.enterprisewebservice.model.Note;
import com.enterprisewebservice.model.StrapiEventPayload;
import com.enterprisewebservice.model.StrapiServiceResponse;
import com.enterprisewebservice.model.Task;
import com.enterprisewebservice.model.TaskNote;

import io.micrometer.core.annotation.Counted;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/assessments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GPTAssessmentResource {

    @Inject
    NoteService noteService;

    @Inject
    RedisSearchIndexer redisSearchIndexer;
    
    @Inject
    EmbeddingService embeddingService;

    @Inject
    TaskNoteService taskNoteService;

    @Inject
    VLLMEmbeddingService vllmEmbeddingService;

    @Inject
    MeterRegistry registry;

    @ConfigProperty(name = "modeltype")
    String modelType;

    @GET
    @Path("/test")
    public Response getTestValue() {
        return Response.ok("Test value").build();
    }


    @POST
    @Counted(value = "note_create_embedding")
    @Path("/create-embedding")
    public Response getNoteAndIndex(StrapiEventPayload payload) {
        try {
           if (payload == null || !payload.getModel().equals("note")) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Payload is not a note").build();
            }
           System.out.println("Payload: " + payload.toString());
            Note note = (Note)payload.getEntry();
            Long id = note.getId();

            StrapiServiceResponse<Note> result = noteService.getNote(id);

            // Assuming the object has a method for getting the data
            note = result.getData();

            String keycloakSubject = result.getData().getUserProfile().getKeycloaksubject();

            // Create the index
            redisSearchIndexer.createIndex();
            List<String> texts = ChunkingService.chunkObject(note.getName() + " " + note.getRichText());
            EmbeddingResponse embeddingResponse = null;
            
            if (modelType.equals("openai")) {
                embeddingResponse = embeddingService.generateEmbeddings(texts);
            } else {
                embeddingResponse = vllmEmbeddingService.generateEmbeddings(texts);
            }
                
            // Fetch the TaskNote objects by Note id
            System.out.println("note id: " + note.getId());
            StrapiServiceResponse<List<TaskNote>> taskNotes = taskNoteService.getByNoteId(note.getId().toString(), false);
            List<Task> uniqueTasks = new ArrayList<>();
            List<Long> taskIds = new ArrayList<>();
            for (TaskNote taskNote : taskNotes.getData()) {
                if (!uniqueTasks.contains(taskNote.getTask())) {
                    uniqueTasks.add(taskNote.getTask());
                    taskIds.add(taskNote.getTask().getId());
                }
            }
            System.out.println("Unique tasks size: " + uniqueTasks.size());

            // Index the embeddings
            redisSearchIndexer.indexEmbeddings(embeddingResponse, note.getId().toString(), texts, keycloakSubject, taskIds);

            return Response.ok(note).build(); // returns the note object

        } catch (Exception e) {
            // Handle exception appropriately
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @POST
    @Path("/delete-embedding")
    public Response deleteNoteIndex(StrapiEventPayload payload) {
        try {
           if (payload == null || !payload.getModel().equals("note")) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Payload is not a note").build();
            }
            System.out.println("Payload: " + payload.toString());
            Note note = (Note)payload.getEntry();
            Long id = note.getId();

            StrapiServiceResponse<Note> result = noteService.getNote(id);

            // Assuming the object has a method for getting the data

            String keycloakSubject = result.getData().getUserProfile().getKeycloaksubject();
            // Assuming the object has a method for getting the data
           
            // Index the embeddings
            redisSearchIndexer.deleteEmbedding(id.toString(), result.getData());

            return Response.ok(id).build(); // returns the note object

        } catch (Exception e) {
            // Handle exception appropriately
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/delete-all-embeddings")
    public Response deleteEmbeddings() {
        try {
           
            redisSearchIndexer.deleteDocuments();
            return Response.ok().build(); // returns the note object

        } catch (Exception e) {
            // Handle exception appropriately
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }
}
