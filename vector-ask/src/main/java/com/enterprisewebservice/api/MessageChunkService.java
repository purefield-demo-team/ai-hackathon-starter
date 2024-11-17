package com.enterprisewebservice.api;

import java.io.IOException;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import com.enterprisewebservice.completion.CompletionResponse;
import com.enterprisewebservice.model.ErrorResponse;
import com.enterprisewebservice.model.GPTAssessment;
import com.enterprisewebservice.model.MessageChunk;
import com.enterprisewebservice.model.Note;
import com.enterprisewebservice.model.StrapiServiceResponse;
import com.enterprisewebservice.model.Task;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import redis.clients.jedis.search.Document;

@ApplicationScoped
public class MessageChunkService {
    
    @Inject
    ApiClient apiClient;

    @Inject
    NoteService noteService;
    
    private final ObjectMapper objectMapper = new ObjectMapper(); // replace with your actual JSON library

    public StrapiServiceResponse<List<MessageChunk>> getAll(String keycloakSubject) throws IOException {
        if (keycloakSubject == null || keycloakSubject.isEmpty()) {
            return new StrapiServiceResponse<>(null, new ErrorResponse(400, "Bad Request", "Goal ID is undefined"));
        }
        String response = null;
        try {
            response = apiClient.get("/message-chunks?filters[keycloaksubject][$eq]="+keycloakSubject + "&sort[0]=createdAt%3Aasc");
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return objectMapper.readValue(response, objectMapper.getTypeFactory().constructParametricType(StrapiServiceResponse.class, objectMapper.getTypeFactory().constructCollectionType(List.class, MessageChunk.class)));

    }


    private StrapiServiceResponse<MessageChunk> create(MessageChunk messageChunk) {
        try {
            System.out.println("creating chunk: " + messageChunk);
            String response = apiClient.post("/message-chunks", messageChunk);
            MessageChunk resultData = objectMapper.readValue(response, MessageChunk.class);
            System.out.println("created message chunk: " + resultData.getId());
            return new StrapiServiceResponse<>(resultData, null);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(500, "Internal Server Error", e.getMessage());
            System.out.println("error creating message chunk: " + error.getData().toString());
            return new StrapiServiceResponse<>(null, error);
        }
    }

    public MessageChunk initializeMessageChunk(Document doc)
    {
        String noteIdString = doc.getString("title"); 
        MessageChunk messageChunk = new MessageChunk();
            if(noteIdString != null && noteIdString.matches("-?\\d+"))
            {
                Long noteId = Long.parseLong(noteIdString);
                StrapiServiceResponse<Note> result = null;;
                try {
                    result = noteService.getNote(noteId);
                     // Assuming the object has a method for getting the data
                    Note note = result.getData();
                    messageChunk.setNote(note);
                    messageChunk.setKeycloakSubject(doc.getString("subject"));
                    messageChunk.setText(doc.getString("description"));
                    String index = doc.getString("index");
                    if(index != null && index.matches("-?\\d+"))
                    {
                        messageChunk.setNoteIndex(Integer.parseInt(index));
                    }
                    
                } catch (IOException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }

               
        }
        return create(messageChunk).getData();
    }
}