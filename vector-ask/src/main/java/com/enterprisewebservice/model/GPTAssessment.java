package com.enterprisewebservice.model;

import java.util.List;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GPTAssessment {
    private Long id;
    private String assessment;
    private List<Task> tasks;
    private UserProfile userProfile;
    private List<Tag> tags;
    private List<Note> notes;   
    private Date createdAt;
    private Date updatedAt;
    private Date createDate;
    private String completionId;
    private List<MessageChunk> messageChunks;
    
    
    public List<MessageChunk> getMessageChunks() {
        return messageChunks;
    }
    public void setMessageChunks(List<MessageChunk> messageChunks) {
        this.messageChunks = messageChunks;
    }
    public Date getCreateDate() {
        return createDate;
    }
    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getAssessment() {
        return assessment;
    }
    public void setAssessment(String assessment) {
        this.assessment = assessment;
    }
    public List<Task> getTasks() {
        return tasks;
    }
    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }
    public UserProfile getUserProfile() {
        return userProfile;
    }
    public void setUserProfile(UserProfile userProfile) {
        this.userProfile = userProfile;
    }
    public List<Tag> getTags() {
        return tags;
    }
    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
    public List<Note> getNotes() {
        return notes;
    }
    public void setNotes(List<Note> notes) {
        this.notes = notes;
    }
    public Date getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public Date getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    } 
    public String getCompletionId() {
        return completionId;
    }
    public void setCompletionId(String completionId) {
        this.completionId = completionId;
    }
}
