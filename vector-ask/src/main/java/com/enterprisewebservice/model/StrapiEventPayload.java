package com.enterprisewebservice.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(using = StrapiEventPayloadDeserializer.class)
public class StrapiEventPayload<T> {
    private String event;
    private String createdAt;
    private String model;
    private T entry;

    public String getEvent() {
        return event;
    }
    public void setEvent(String event) {
        this.event = event;
    }
    public String getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    public String getModel() {
        return model;
    }
    public void setModel(String model) {
        this.model = model;
    }
    public T getEntry() {
        return entry;
    }
    public void setEntry(T entry) {
        this.entry = entry;
    }

    @Override
    public String toString() {
        return "StrapiEventPayload [createdAt=" + createdAt + ", entry=" + entry + ", event=" + event + ", model="
                + model + "]";
    }
}
