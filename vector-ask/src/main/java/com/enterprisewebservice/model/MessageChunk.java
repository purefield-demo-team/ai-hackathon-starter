package com.enterprisewebservice.model;

public class MessageChunk {
    private Long id;
    private String text;
    private String keycloakSubject;
    private Note note;
    
    private Integer noteIndex;

    public MessageChunk() {
    }

    public MessageChunk(String text, String keycloakSubject) {
        this.text = text;
        this.keycloakSubject = keycloakSubject;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Note getNote() {
        return note;
    }

    public void setNote(Note note) {
        this.note = note;
    }


    public String getKeycloakSubject() {
        return keycloakSubject;
    }

    public void setKeycloakSubject(String keycloakSubject) {
        this.keycloakSubject = keycloakSubject;
    }

    public Integer getNoteIndex() {
        return noteIndex;
    }

    public void setNoteIndex(Integer noteIndex) {
        this.noteIndex = noteIndex;
    }
}
