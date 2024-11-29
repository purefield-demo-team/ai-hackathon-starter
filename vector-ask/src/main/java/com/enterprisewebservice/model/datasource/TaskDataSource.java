package com.enterprisewebservice.model.datasource;

import com.enterprisewebservice.model.Task;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskDataSource {
    private Long id;
    private RagDataSource dataSource;
    private Task task;
    private String taskDataSourceid;
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public RagDataSource getDataSource() {
        return dataSource;
    }
    public void setDataSource(RagDataSource dataSource) {
        this.dataSource = dataSource;
    }
    public Task getTask() {
        return task;
    }
    public void setTask(Task task) {
        this.task = task;
    }
    public String getTaskDataSourceid() {
        return taskDataSourceid;
    }
    public void setTaskDataSourceid(String taskDataSourceid) {
        this.taskDataSourceid = taskDataSourceid;
    }
}
