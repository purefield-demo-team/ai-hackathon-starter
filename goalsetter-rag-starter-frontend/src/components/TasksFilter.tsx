import React, { useState, useEffect } from 'react';
import { Tag } from '../models/Tag';
import tagService from '../services/tagService';
import taskService from '../services/taskService';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { Task, TaskStatus } from '../models/Task';
import { Goal } from '../models/Goal';
import CreatedTasksList from './CreatedTaskList';
import goalTaskService from '../services/goalTaskService';
import TagSelect from './TagSelect';
import { Container, Typography, Button, Box, Grid, Modal, Backdrop, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ToggleButton from '@mui/material/ToggleButton';
import { useTags } from '../contexts/TagContext';

interface TasksFilterProps {
  keycloakSubject: string | undefined;
  goal?: Goal | undefined;
  refresh?: boolean;
  addTaskButton?: React.ReactNode;
}

const TasksFilter: React.FC<TasksFilterProps> = ({ keycloakSubject, goal, refresh, addTaskButton }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const { selectedTags, setSelectedTags } = useTags();

  const [tasks, setTasks] = useState<Task[] | null | undefined>(null);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  


  const fetchAndSortTasks = async (selectedTags: Tag[] = [], newShowCompleted: boolean): Promise<Task[] | null> => {
    let fetchedTasks: Task[] | null = null;
    
    if (selectedTags.length > 0) {
      const response: StrapiServiceResponse<Task[]> = await taskService.getByTags(selectedTags, showCompleted);
      if (response.data) {
        if (goal) {
          const goalTasksResponse = await goalTaskService.getByGoalId(goal.id, showCompleted);
          if (goalTasksResponse.data) {
            const goalTaskIds = goalTasksResponse.data.map(goalTask => goalTask.task.id);
            fetchedTasks = response.data.filter(task => goalTaskIds.includes(task.id));
          }
        } else {
          fetchedTasks = response.data;
        }
      }
    } else {
      if (goal) {
        const goalTasksResponse = await goalTaskService.getByGoalId(goal.id, showCompleted);
        if (goalTasksResponse.data) {
          fetchedTasks = goalTasksResponse.data.map(goalTask => goalTask.task);
        }
      } else {
        const response: StrapiServiceResponse<Task[]> = await taskService.getAll(keycloakSubject, showCompleted);
        if (response.data) {
          fetchedTasks = response.data;
        }
      }
    }

    fetchedTasks = (fetchedTasks ?? []).sort((a, b) => {
      const aPastDue = a.dueDate && new Date(a.dueDate) < new Date();
      const bPastDue = b.dueDate && new Date(b.dueDate) < new Date();

      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      if (aPastDue && !bPastDue) return -1;
      if (!aPastDue && bPastDue) return 1;

      if (a.status !== b.status) {
        if (a.status === 'not started' && b.status === 'in progress') return -1;
        if (a.status === 'in progress' && b.status === 'not started') return 1;
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return 0;
    });

    return fetchedTasks;
  }
  
  
  useEffect(() => {
    fetchAndSortTasks(selectedTags, showCompleted).then(setTasks);
  }, [selectedTags, showCompleted]);

  useEffect(() => {
    const fetchTags = async () => {
      const response: StrapiServiceResponse<Tag[]> = await tagService.getAll(keycloakSubject);
      if (response.data) {
        let updatedTags = [...response.data];
        selectedTags.forEach((initialTag) => {
          if (!updatedTags.find((tag) => tag.id === initialTag.id)) {
            updatedTags.push(initialTag);
          }
        });
        setTags(updatedTags);

      }
    };
  
    fetchTags();
    fetchAndSortTasks(selectedTags, showCompleted).then(setTasks);
  }, [keycloakSubject, refresh, goal, JSON.stringify(selectedTags)]);
  
  useEffect(() => {
    if (JSON.stringify(selectedTags) !== JSON.stringify(selectedTags) && selectedTags.length > 0) {
      setSelectedTags(selectedTags);
    }
  }, [selectedTags]);
  

  const handleTagSelection = (selectedTags: Tag[]) => {
    setSelectedTags(selectedTags);
  };
  
  const toggleShowCompleted = () => {
    setShowCompleted((prevShowCompleted) => !prevShowCompleted);
  };
  
  
  

  const deleteTask = async (id: string | undefined) => {
    if (id) {
      const result = await taskService.delete(id);
      if (!result.error) {
        // Remove the deleted task from the tasks state
        setTasks(tasks?.filter(task => task.id?.toString() !== id) ?? []);
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
      setTasks((prevTasks) =>
        prevTasks?.map((task) => (task.id?.toString() === taskId ? updatedTask : task)) ?? null
      );

    } else {
      // Handle errors while updating the task status, e.g., show an error message
      console.error('Error updating task status:', updateResponse.error);
    }
  };

  return (
    <Box paddingTop={2}>
      <TagSelect tags={tags} selectedTags={selectedTags} onSelectionChange={handleTagSelection} /><ToggleButton
      value="check"
      selected={showCompleted}
      onChange={toggleShowCompleted}
    >
      Show completed tasks
    </ToggleButton>
      <CreatedTasksList
              tasks={tasks}
              onDeleteTask={deleteTask}
              onTaskStatusChange={handleTaskStatusChange}
              previousRoute={goal ? `/update-goal/${goal.id}` : '/create-task'}
              addTaskButton={addTaskButton}
            />
    </Box>
  );
};

export default TasksFilter;