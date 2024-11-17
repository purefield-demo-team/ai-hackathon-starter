package com.enterprisewebservice.completion;

import java.util.List;

import com.enterprisewebservice.model.MessageChunk;

public class ArticleSearchResults {
    private List<MessageChunk> messageChunks;
    private String messageSummary;
    
    public List<MessageChunk> getMessageChunks() {
        return messageChunks;
    }
    public void setMessageChunks(List<MessageChunk> messageChunks) {
        this.messageChunks = messageChunks;
    }
    public String getMessageSummary() {
        return messageSummary;
    }
    public void setMessageSummary(String messageSummary) {
        this.messageSummary = messageSummary;
    }
}
