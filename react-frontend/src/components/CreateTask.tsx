import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchData } from '../hooks/useFetchData';
import taskService from '../services/taskService';
import { useUserProfile } from '../contexts/UserProfileContext';
import userProfileService from '../services/userProfileService';
import goalService from '../services/goalService';
import goalTaskService from '../services/goalTaskService';
import { GoalTask } from '../models/GoalTask';
import { Goal, GoalStatus } from '../models/Goal';
import { Task, TaskStatus } from '../models/Task';
import { UserProfile } from '../models/UserProfile';
import { useKeycloak } from "@react-keycloak/web";
import CreatedTasksList from './CreatedTaskList';
import { TagInput } from './TagInput';
import TasksFilter from './TasksFilter';
import {Tag} from '../models/Tag';
import TaskForm from './TaskForm';
import { Container, Typography, Grid, Button } from '@mui/material';
import '../App.css';
import tagService from '../services/tagService';

const CreateTask: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [closeDate, setCloseDate] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<TaskStatus>('not started');
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useUserProfile();
  const [task, setTask] = useState<Task>({
    title: '',
    description: '',
    startDate: undefined,
    closeDate: undefined,
    dueDate: undefined,
    status: 'not started',
    userProfile: userProfile || undefined,
    tags: [],
  });
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [refreshFilter, setRefreshFilter] = useState(false);

  useEffect(() => {
    setRefreshFilter(false); // Reset the refreshFilter state variable
  }, [refreshFilter]);
  
  const handleFormChange = (field: keyof Task, value: any) => {
    setTask((prevTask) => ({
      ...prevTask,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!userProfile) {
      return;
    }
  
    const newTask: Task = {
      ...task,
      userProfile,
      tags: tags, // Use the tags from the state instead of task object
    };
  
    const response = await taskService.create(newTask);
  
    if (response.data) {
      // Clear the form
      setTask({
        title: '',
        description: '',
        startDate: undefined,
        closeDate: undefined,
        dueDate: undefined,
        status: 'not started',
        userProfile,
        tags: [],
      });
  
      // Clear the tags state
      setTags([]);
  
      // Update the list of tasks
      setRefreshFilter(true);
      navigate(`/update-task/${response.data.id}`);
    }
  
    // Display a success message or handle errors
    
  };
  

  useEffect(() => {
    setTask((prevTask) => ({
      ...prevTask,
      tags: tags,
    }));
  }, [tags]);
  

  const deleteTask = async (id: string | undefined) => {
    if (id) {
      const result = await taskService.delete(id);
      if (!result.error) {
        //refresh(); // Call refresh function from useFetchData hook to update the task list
      } else {
        alert(`Error deleting task: ${result.error.statusText}`);
      }
    }
  };

  const handleTaskStatusChange = async (taskId: string | undefined, newStatus: TaskStatus) => {
    if (!taskId) return;
  
    // Fetch the task by its ID
    const taskResponse = await taskService.get(taskId);
  
    if (!taskResponse.data) {
      console.error('Error fetching task:', taskResponse.error);
      return;
    }
  
    // Update the task status
    const updatedTask: Task = {
      ...taskResponse.data,
      status: newStatus,
    };
  
    // Save the updated task to the server
    const updateResponse = await taskService.update(taskId, updatedTask);
  
    if (!updateResponse.error) {
      // Update the local tasks state with the updated task
      // setTasks((prevTasks) =>
      //   prevTasks?.map((task) => (task.id?.toString() === taskId ? updatedTask : task)) ?? null
      // );

    } else {
      // Handle errors while updating the task status, e.g., show an error message
      console.error('Error updating task status:', updateResponse.error);
    }
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setTags(newTags);
  };
  

  return (
    <Grid container>
      <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
        <TasksFilter keycloakSubject={userProfile?.keycloaksubject} refresh={refreshFilter} />
      </Grid>
      <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
        <Typography variant="h4" gutterBottom>Create Task</Typography>
        <TagInput task={task} onTagsChange={handleTagsChange} userProfile={userProfile} />
        <TaskForm
          task={task}
          goals={null}
          goalTasks={null}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          showGoalsDropdown={true}
        >
          <Grid container justifyContent="space-between" alignItems="center" mt={2}>
            <Grid item>
              <Button variant="contained" color="secondary" type="submit">Create Task</Button>
            </Grid>
          </Grid>
        </TaskForm>
      
      </Grid>
    </Grid>
  );
};

export default CreateTask;
