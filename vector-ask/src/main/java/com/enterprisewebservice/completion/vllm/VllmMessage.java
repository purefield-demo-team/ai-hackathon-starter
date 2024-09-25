package com.enterprisewebservice.completion.vllm;

public class VllmMessage {
    private String role;
    private String content;

    public VllmMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }

    // Getters and setters

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}