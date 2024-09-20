import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import goalService from '../services/goalService';
import { Goal, GoalStatus } from '../models/Goal';
import { GoalTask } from '../models/GoalTask';
import { useUserProfile } from '../contexts/UserProfileContext';
import goalTask from '../services/goalTaskService';
import GoalForm from './GoalForm';
import { Tag } from '../models/Tag';
import { TagInput } from './TagInput';
import { Task, TaskStatus } from '../models/Task';
import taskService from '../services/taskService';
import CreatedTasksList from './CreatedTaskList';
import { useFetchData } from '../hooks/useFetchData';
import TasksFilter  from './TasksFilter';
import TaskForm from './TaskForm';
import { Container, Typography, Button, Box, Grid, Modal, Backdrop, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/system';
import { useMediaQuery } from '@mui/material';
import Fab from '@mui/material/Fab';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import GoalsFilter from './GoalsFilter';

import '../App.css';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { Refresh } from '@mui/icons-material';

const UpdateGoal: React.FC = () => {
  const { id } = useParams();
  const [tags, setTags] = useState<Tag[]>([]);
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal>();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const { userProfile, setUserProfile } = useUserProfile();
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [open, setOpen] = useState(false);
  

  // State variables for TaskForm
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [closeDate, setCloseDate] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<TaskStatus>('not started');
  const [refreshFilter, setRefreshFilter] = useState(false);

  useEffect(() => {
    setRefreshFilter(false); // Reset the refreshFilter state variable
  }, [refreshFilter]);

  useEffect(() => {
    
    const fetchGoal = async () => {
      const goalId = id ? parseInt(id) : undefined;
      const response = await goalService.get(goalId);
      if(response && response.data)
      {
        if(!response.data.tags)
        {
          response.data.tags = [];
        }
      }
      
      setGoal(response.data ?? undefined);
      
     
    };

    const fetchTasks = async () => {
      const goalId = id ? parseInt(id) : undefined;
      const response = await goalTask.getByGoalId(goalId, true);
      setTasks(response.data?.map(goalTask => goalTask.task) ?? []);
    };

    fetchGoal();
    fetchTasks();
  }, [id]);

  

  const handleTaskModal = () => {
    setOpenTaskModal(!openTaskModal);
  };

  const addTaskButton = (
    <IconButton color="primary" onClick={handleTaskModal}>
      <AddIcon />
    </IconButton>
  );
  

  // TaskForm handlers
  const handleFormChange = (field: keyof Task, value: any) => {
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      case 'closeDate':
        setCloseDate(value);
        break;
      case 'status':
        setStatus(value as TaskStatus);
        break;
      case 'tags':
        setTags(value);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!userProfile || !goal) {
      return;
    }
  
    const taskData: Task = {
      title,
      description,
      dueDate: dueDate || undefined,
      startDate: startDate || undefined,
      closeDate: closeDate || undefined,
      status,
      userProfile,
      tags: goal.tags,
    };
  
    const response = await taskService.create(taskData);
  
    if (response.data) {
      // Create GoalTask
      const goalTaskData: GoalTask = {
        goal: goal,
        task: response.data,
      };
  
      const goalTaskResponse = await goalTask.create(goalTaskData);
  
      if (goalTaskResponse.data) {
        // Clear the form
        setTitle('');
        setDescription('');
        setStartDate(undefined);
        setCloseDate(undefined);
        setDueDate(undefined);
        setStatus('not started');
  
        // Update the list of tasks
        setTasks([...(tasks || []), response.data]);
      } else {
        // Handle error while creating GoalTask, e.g., show an error message
        console.error('Error creating GoalTask:', goalTaskResponse.error);
      }
    }
    setRefreshFilter(true);
    // Close the modal
    setOpenTaskModal(false);
  };
  

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!goal) return;

    await goalService.update(id, goal);

    // Handle successful update, e.g., show a success message or redirect
  };

  const handleTagsChange = (tags: Tag[]) => {
    if(goal)
    {
      setGoal({ ...goal, tags: tags });
    }
      
  };

  const handleGoalFormChange = (field: keyof Goal, value: any) => {
    if (!goal) return;
  
    setGoal((prevState) => ({
      ...(prevState as Goal),
      [field]: value,
    }));
  };
  
  const handleGoBack = () => {
    navigate('/create-goal');
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
  

  if (!goal) {
    return <div>Loading...</div>;
  }

  const actions = [
    { icon: <EditIcon />, name: 'Update Goal', onClick: handleUpdate },
    { icon: <ArrowBackIcon />, name: 'Previous', onClick: handleGoBack },
    
  ];

  return (
    <Grid container>
      <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
        <GoalsFilter keycloakSubject={userProfile?.keycloaksubject} />
      </Grid>
      <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
        <Typography variant="h4" gutterBottom>
            Update Goal
          </Typography>
          {goal && goal.tags ? (
          <TagInput
            goal={goal}
            onTagsChange={handleTagsChange}
            userProfile={userProfile}
          />
          ) : null}
          <GoalForm
            goal={goal}
            onSubmit={handleUpdate}
            onChange={handleGoalFormChange}
          >
            {isMobile ? (
              <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
                <SpeedDial
                  ariaLabel="SpeedDial example"
                  icon={<SpeedDialIcon />}
                  onClose={() => setOpen(false)}
                  onOpen={() => setOpen(true)}
                  open={open}
                  direction="up"
                >
                  {actions.map((action) => (
                    <SpeedDialAction
                      key={action.name}
                      icon={action.icon}
                      tooltipTitle={action.name}
                      onClick={action.onClick}
                    />
                  ))}
                </SpeedDial>
              </Box>
            ) : (
              <Grid container spacing={2} justifyContent="space-between" alignItems="center" mt={2}>
                <Grid item>
                  <Button variant="contained" color="secondary" type="submit">
                    Update Goal
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="secondary" onClick={handleGoBack}>
                    Previous
                  </Button>
                </Grid>
              
              </Grid>
            )}
          </GoalForm>
    
        <Box mt={4}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
              <TasksFilter keycloakSubject={userProfile?.keycloaksubject} goal={goal} addTaskButton={addTaskButton} refresh={refreshFilter} />
            </Grid>
          </Grid>
        </Box>
    
        <Modal
          open={openTaskModal}
          onClose={handleTaskModal}
          aria-labelledby="add-task-modal-title"
          aria-describedby="add-task-modal-description"
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              padding: 2,
              borderRadius: 1,
              boxShadow: 24,
              minWidth: '50%',
            }}
          >
            <TaskForm
              task={{
                title,
                description,
                dueDate,
                startDate,
                closeDate,
                status,
              }}
              goals={null}
              goalTasks={null}
              onSubmit={handleSubmit}
              onChange={handleFormChange}
              showGoalsDropdown={false}
            >
              <Grid container justifyContent="space-between" alignItems="center" mt={2}>
                <Grid item>
                  <Button variant="contained" color="secondary" type="submit">
                    Create Task
                  </Button>
                </Grid>
              </Grid>
            </TaskForm>
          </Box>
        </Modal>
      </Grid>
    </Grid>
  );
  
};

export default UpdateGoal;

