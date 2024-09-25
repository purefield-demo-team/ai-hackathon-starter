package com.enterprisewebservice.model;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

public class StrapiEventPayloadDeserializer extends JsonDeserializer<StrapiEventPayload<?>> {

    @Override
    public StrapiEventPayload<?> deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException, JsonProcessingException {
        ObjectMapper mapper = (ObjectMapper) jp.getCodec();
        JsonNode node = mapper.readTree(jp);

        StrapiEventPayload<Object> payload = new StrapiEventPayload<>();
        payload.setEvent(node.get("event").asText());
        payload.setCreatedAt(node.get("createdAt").asText());
        payload.setModel(node.get("model").asText());

        if ("task-note".equals(payload.getModel())) {
            TaskNote taskNote = mapper.treeToValue(node.get("entry"), TaskNote.class);
            payload.setEntry(taskNote);
        } else if ("task".equals(payload.getModel())) {
            Task task = mapper.treeToValue(node.get("entry"), Task.class);
            payload.setEntry(task);
        } else if ("note".equals(payload.getModel())) {
            Note note = mapper.treeToValue(node.get("entry"), Note.class);
            payload.setEntry(note);
        } else {
            // Handle other types or throw an exception
        }

        return payload;
    }
}
