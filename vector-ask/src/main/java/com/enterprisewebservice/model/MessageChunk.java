package com.enterprisewebservice.model;

public class MessageChunk {
    private Long id;
    private String message;
    private String keycloakSubject;
    private Long noteid;
    private Integer noteIndex;

    public MessageChunk() {
    }

    public MessageChunk(String message, String keycloakSubject) {
        this.message = message;
        this.keycloakSubject = keycloakSubject;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getKeycloakSubject() {
        return keycloakSubject;
    }

    public void setKeycloakSubject(String keycloakSubject) {
        this.keycloakSubject = keycloakSubject;
    }

    public Long getNoteid() {
        return noteid;
    }

    public Integer getNoteIndex() {
        return noteIndex;
    }

    public void setNoteid(Long noteid) {
        this.noteid = noteid;
    }

    public void setNoteIndex(Integer noteIndex) {
        this.noteIndex = noteIndex;
    }
}
