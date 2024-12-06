package com.enterprisewebservice.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.locks.ReentrantLock;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.enterprisewebservice.RedisSearchIndexer;
import com.enterprisewebservice.completion.CompletionResponse;
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

@Path("/notes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NoteResource {

    @Inject
    NoteService noteService;

    @Inject
    RedisSearchIndexer redisSearchIndexer;
    
    @Inject
    EmbeddingService embeddingService;

    @Inject
    VLLMEmbeddingService vllmEmbeddingService;

    @Inject
    TaskNoteService taskNoteService;

    @Inject
    MeterRegistry registry;

    @Inject
    TaskService taskService;

    @Inject
    GPTAssessmentService gptAssessmentService;

    @ConfigProperty(name = "modeltype")
    String modelType;

    private Set<Long> processingSet = ConcurrentHashMap.newKeySet();

    // Concurrent hashmap to store payload IDs with their timestamps
    // private ConcurrentHashMap<Long, ScheduledFuture<?>> noteMap = new ConcurrentHashMap<>();
    // private ConcurrentHashMap<Long, ScheduledFuture<?>> taskMap = new ConcurrentHashMap<>();
    // private ScheduledExecutorService executorService = Executors.newScheduledThreadPool(10);

    private ConcurrentHashMap<Long, ScheduledFuture<?>> assessmentMap = new ConcurrentHashMap<>();
    private ConcurrentHashMap<Long, ReentrantLock> lockMap = new ConcurrentHashMap<>();
    private ScheduledExecutorService executorService = Executors.newScheduledThreadPool(10);


    @GET
    @Path("/test")
    public Response getTestValue() {
        return Response.ok("Test value").build();
    }

    @POST
    @Path("/create-assessment")
    public Response createAssessment(StrapiEventPayload payload) {
        try {
            System.out.println("Payload model in create-assessment: " + payload.getModel());
    
            // Check for both "task" and "task-note"
            if (payload == null || (!payload.getModel().equals("task-note") && !payload.getModel().equals("task"))) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Payload is neither a task nor a task note").build();
            }
    
            Long id = null;
            if (payload.getModel().equals("task-note")) {
                TaskNote taskNote = (TaskNote) payload.getEntry();
                id = taskNote.getId();
            } else if (payload.getModel().equals("task")) {
                Task task = (Task) payload.getEntry();
                id = task.getId();
            }
    
            System.out.println("Payload: " + payload.toString());
    
            // Attempt to mark the id as being processed
            boolean isNew = processingSet.add(id);
            if (!isNew) {
                return Response.ok().entity("Assessment already processed for id: " + id).build();
            }

            try {
                // Process the assessment immediately
                if (payload.getModel().equals("task-note")) {
                    processAssessment(payload);
                } else if (payload.getModel().equals("task")) {
                    Task taskEntry = (Task) payload.getEntry();
                    StrapiServiceResponse<Task> taskData = taskService.getTask(taskEntry.getId().intValue());
                    processAssessment(taskData.getData(), taskData.getData().getUserProfile().getKeycloaksubject());
                }
            } finally {
                // Ensure the id is removed from the set
                processingSet.remove(id);
            }
    
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
        return Response.ok().build();
    }
    

    private void processAssessment(StrapiEventPayload payload) throws IOException {
        TaskNote taskNote = (TaskNote) (payload.getEntry());
        Long id = taskNote.getId();
        StrapiServiceResponse<TaskNote> taskNoteData = taskNoteService.getTaskNote(id);
        taskNote = taskNoteData.getData();
        Task task = taskNote.getTask();
        CompletionResponse assessment = taskService.askQuestion(task.getId().intValue(), task.getUserProfile().getKeycloaksubject());
        gptAssessmentService.initializeAssessment(assessment, task);
    }

    private void processAssessment(Task task, String keycloakSubject) throws IOException {
        System.out.println("Task id generating assessment for: " + task.getId());
        CompletionResponse assessment = taskService.askQuestion(task.getId().intValue(), keycloakSubject);
        System.out.println("Initialize Assessment: " + assessment);
        gptAssessmentService.initializeAssessment(assessment, task);
    }

    @POST
    @Counted(value = "note_create_embedding")
    @Path("/create-embedding")
    public Response getNoteAndIndex(StrapiEventPayload payload) {
        try {
           System.out.println("Payload: " + payload.toString());
           if (payload == null || !payload.getModel().equals("note")) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Payload is not a note").build();
            }
           System.out.println("Payload: " + payload.toString());
            Note note = (Note) (payload.getEntry());
            Long id = note.getId();

            StrapiServiceResponse<Note> result = noteService.getNote(id);

            // Assuming the object has a method for getting the data
            note = result.getData();

            String keycloakSubject = result.getData().getUserProfile().getKeycloaksubject();

            // Create the index
            redisSearchIndexer.createIndex();
            List<String> chunks = ChunkingService.chunkObject(note.getName() + " " + note.getRichText());
            if(chunks != null) {
                note.setChunks(chunks.size());
            }
            noteService.update(note);
           
            System.out.println("Before Embedding response");
            //EmbeddingResponse embeddingResponse = awsBedrockService.invokeTitanEmbedding(chunks);
            
            EmbeddingResponse embeddingResponse = null;
            
            if (modelType.equals("openai")) {
                embeddingResponse = embeddingService.generateEmbeddings(chunks);
            } else {
                embeddingResponse = vllmEmbeddingService.generateEmbeddings(chunks);
            }

            System.out.println("Embedding response object: " + embeddingResponse.getObject());

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
            redisSearchIndexer.indexEmbeddings(embeddingResponse, note.getId().toString(), chunks, keycloakSubject, taskIds);

           
            // associate the tasks with the note in the embedding

            // Ask a question for every unique Task
            // for (Task task : uniqueTasks) {

            //     lockMap.putIfAbsent(task.getId(), new ReentrantLock());
            //     ReentrantLock lock = lockMap.get(task.getId());

            //     lock.lock();
            //     try {
            //         ScheduledFuture<?> previousTask = assessmentMap.remove(task.getId());
            //         if (previousTask != null) {
            //             previousTask.cancel(false);
            //         }

            //         ScheduledFuture<?> future = executorService.schedule(() -> {
            //             try {
            //                 processAssessment(task, keycloakSubject);
            //             } catch (Exception e) {
            //                 e.printStackTrace();
            //             }
            //         }, 1, TimeUnit.MINUTES);

            //         assessmentMap.put(task.getId(), future);
            //     } finally {
            //         lock.unlock();
            //     }
                
            // }

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
            System.out.println("Payload in delete embedding: " + payload.toString());
           if (payload == null || !payload.getModel().equals("note") && payload.getEvent().equals("entry.delete")) {
            System.out.println("Payload: " + payload.toString());
                return Response.status(Response.Status.BAD_REQUEST).entity("Payload is not a note").build();
            }
            System.out.println("Payload: " + payload.toString());
            Note note = (Note) (payload.getEntry());
            Long id = note.getId();
            
            //StrapiServiceResponse<Note> result = noteService.getNote(id);

            // Assuming the object has a method for getting the data

            //String keycloakSubject = result.getData().getUserProfile().getKeycloaksubject();

            // Assuming the object has a method for getting the data
           
            // Index the embeddings
            redisSearchIndexer.deleteEmbedding(id.toString(), note);

            return Response.ok(id).build(); // returns the note object

        } catch (Exception e) {
            // Handle exception appropriately
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @POST
    @Path("/delete-task-notes")
    public Response deleteTaskNote(StrapiEventPayload payload) {
        try {
           if (payload == null || !payload.getModel().equals("note")) {
                return Response.status(Response.Status.BAD_REQUEST).entity("Payload is not a note so do not delete a task note").build();
            }
            System.out.println("Deleting TaskNotes for Note Payload: " + payload.toString());
            Note note = (Note) (payload.getEntry());
            Long id = note.getId();
            

            // Assuming the object has a method for getting the data
           
            // Index the embeddings
             // Fetch the TaskNote objects by Note id
            StrapiServiceResponse<List<TaskNote>> taskNotes = taskNoteService.getByNoteId(id.toString(), false);
            
            for (TaskNote taskNote : taskNotes.getData()) {
                taskNoteService.delete(taskNote.getId());
            }

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
