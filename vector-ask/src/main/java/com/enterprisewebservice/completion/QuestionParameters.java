package com.enterprisewebservice.completion;

import java.util.List;

public class QuestionParameters {
    List<Long> taskIds;
    String subject;
    
    public List<Long> getTaskIds() {
        return taskIds;
    }
    public void setTaskIds(List<Long> taskIds) {
        this.taskIds = taskIds;
    }
    public String getSubject() {
        return subject;
    }
    public void setSubject(String subject) {
        this.subject = subject;
    }

}
