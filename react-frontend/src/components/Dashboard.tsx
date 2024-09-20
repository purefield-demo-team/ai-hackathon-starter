import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUserProfile } from '../contexts/UserProfileContext';
import goalService from '../services/goalService';
import taskService from '../services/taskService';
import { Goal } from '../models/Goal';
import { Task, TaskStatus } from '../models/Task';
import { Tabs, Tab } from '@mui/material';
import TasksFilter  from './TasksFilter';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import UnifiedFilter from './unifiedfilter/UnifiedFilter';
import { Container, Typography, Button, Checkbox, ListItemText, Box, Grid, Modal, Backdrop, IconButton, FormControl, Select, InputLabel, MenuItem } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskForm from './TaskForm';
import { Tag } from '../models/Tag';
import tagService from '../services/tagService';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useTags } from '../contexts/TagContext';

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '80%',
    maxWidth: '600px',
  }
}));

const CustomSelect = styled(Select)(({ theme }) => ({
  width: '100%',
}));

const Dashboard: React.FC = () => {
    const [completionRate, setCompletionRate] = useState(0);
    const [streak, setStreak] = useState(0);
    const { userProfile } = useUserProfile();
    const [openTaskModal, setOpenTaskModal] = useState(false);
    const [tags, setTags] = useState<Tag[]>([]);
    const [tasks, setTasks] = useState<Task[] | null>(null);
    const { selectedTags, setSelectedTags } = useTags();
    const [openModal, setOpenModal] = useState(false);
    const [dialogTags, setDialogTags] = useState<Tag[]>([]);
    
    const [metrics, setMetrics] = useState<{
        goalCount: number;
        taskCount: number;
        goalCompletionRate: number;
        taskCompletionRate: number;
      }>({
        goalCount: 0,
        taskCount: 0,
        goalCompletionRate: 0,
        taskCompletionRate: 0,
      });
      
      useEffect(() => {
        const fetchMetrics = async () => {
          const goalResponse: StrapiServiceResponse<Goal[]> = await goalService.getAll(userProfile?.keycloaksubject);
          const taskResponse: StrapiServiceResponse<Task[]> = await taskService.getAll(userProfile?.keycloaksubject, true);
      
          const allGoals = goalResponse.data || [];
          const allTasks = taskResponse.data || [];
      
          const completedGoals = allGoals.filter((goal) => goal.status === 'completed');
          const goalCompletionRate = allGoals.length > 0 ? Math.round((completedGoals.length / allGoals.length) * 100) : 0;
      
          const completedTasks = allTasks.filter((task) => task.status === 'completed');
          const taskCompletionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;
          

          setMetrics({
            goalCount: allGoals.length,
            taskCount: allTasks.length,
            goalCompletionRate,
            taskCompletionRate,
          });
      
          // Calculate streak
          const calculateStreak = (completedTasks: Task[]) => {
            let streak = 0;
            let currentDate = new Date();
      
            for (const task of completedTasks) {
              const completedAt = new Date(task.closeDate!);
              const dayDifference = (currentDate.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);
      
              if (Math.floor(dayDifference) === streak) {
                streak++;
                currentDate = completedAt;
              } else {
                break;
              }
            }
      
            return streak;
          };
      
          const sortedCompletedTasks = completedTasks.sort((a, b) => new Date(b.closeDate!).getTime() - new Date(a.closeDate!).getTime());
          const streak = calculateStreak(sortedCompletedTasks);
      
          setStreak(streak);
        };
      
        if (userProfile) {
          fetchMetrics();
        }
      }, [userProfile]);
  
    const data = [
        {
          name: 'Goal Completion Rate',
          value: metrics.goalCompletionRate,
        },
        {
          name: 'Task Completion Rate',
          value: metrics.taskCompletionRate,
        },
        {
          name: 'Streak',
          value: streak,
        },
      ];


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
      const fetchTags = async () => {
        if (!userProfile) {
          return;
        }

        const response: StrapiServiceResponse<Tag[]> = await tagService.findByDashboardStatus(userProfile?.keycloaksubject, true);

        if (response.data) {
          setTags(response.data);
        }
      };

      fetchTags();
    }, [userProfile]);

    useEffect(() => {
      const fetchDialogTags = async () => {
        if (!userProfile) {
          return;
        }
    
        const response: StrapiServiceResponse<Tag[]> = await tagService.findByDashboardStatus(userProfile?.keycloaksubject, false);
    
        if (response.data) {
          setDialogTags(response.data);
        }
      };
    
      fetchDialogTags();
    }, [userProfile]);
    

    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
      setSelectedTab(newValue);
      if (newValue > 1) {
        setSelectedTags([tags[newValue - 2]]);
      } else {
        setSelectedTags([]);
      }
    };

    const handleRemoveTab = async (tagToRemove: Tag) => {
      const updatedTag = { ...tagToRemove, dashboard: false };
      await tagService.update(tagToRemove.id?.toString(), updatedTag);
  
      setTags(tags.filter((tag) => tag.id !== tagToRemove.id));
    };

    const handleTaskModal = () => {
      setOpenTaskModal(!openTaskModal);
    };

    const handleAddTabClick = () => {
      setOpenModal(!openModal);
    };

    const addTaskButton = (
      <IconButton color="primary" onClick={handleTaskModal}>
        <AddIcon />
      </IconButton>
    );

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

    const handleAddTabs = async () => {
      const updatedTags = [];
      for (const tag of selectedTags) {
        const updatedTag = { ...tag, dashboard: true };
        await tagService.update(tag.id?.toString(), updatedTag);
        updatedTags.push(updatedTag);
      }

      setTags([...tags, ...updatedTags]);
      setOpenModal(false);
    };
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
    
      if (!userProfile) {
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
        tags: [],
      };
    
      const response = await taskService.create(taskData);
    
      if (response.data) {
        
          // Clear the form
        setTitle('');
        setDescription('');
        setStartDate(undefined);
        setCloseDate(undefined);
        setDueDate(undefined);
        setStatus('not started');
  
        // Update the list of tasks
        setTasks([...(tasks || []), response.data]);
        
      }
      setRefreshFilter(true);
      // Close the modal
      setOpenTaskModal(false);
    };
  
    return (
      <Grid container>
        {selectedTab > 0 && (
          <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
            {selectedTab === 1 && (
              <TasksFilter keycloakSubject={userProfile?.keycloaksubject}  refresh={refreshFilter} />
            )}

            {selectedTab > 1 && (
              <TasksFilter keycloakSubject={userProfile?.keycloaksubject} refresh={refreshFilter} />
            )}
          </Grid>
        )}
        <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Today's Focus" />
          {tags.map((tag, index) => (
            <Tab
                key={index}
                label={
                    <div>
                        {tag.name}
                        <IconButton size="small" onClick={(event) => { event.stopPropagation(); handleRemoveTab(tag); }}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                }
            />
          ))}
          <Button onClick={() => setOpenModal(true)}>
            <AddIcon />
            Add Tab
          </Button>
        </Tabs>
        {selectedTab === 0 && (
            <>
              <Box mt={4}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#0ABAB5" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <UnifiedFilter keycloakSubject={userProfile?.keycloaksubject} />
            </>
          )}
        
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

        <CustomDialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle>Select Tags</DialogTitle>
          <DialogContent>
            <FormControl fullWidth>
              <InputLabel id="tags-label">Choose Tags</InputLabel>
              <CustomSelect
                labelId="tags-label"
                multiple
                value={selectedTags.map(tag => tag.id)}
                onChange={(event) => {
                  const selectedTagIds = event.target.value as (string | number)[];
                  setSelectedTags(dialogTags.filter(tag => tag.id !== undefined && selectedTagIds.includes(tag.id)));
                }}
                renderValue={(selected) => {
                  const selectedTagIds = selected as (string | number)[];
                  return selectedTagIds
                    .map((tagId) => dialogTags.find(tag => tag.id === tagId)?.name)
                    .join(', ');
                }}
              >
                {dialogTags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    <Checkbox checked={selectedTags.some(selectedTag => selectedTag.id === tag.id)} />
                    <ListItemText primary={tag.name} />
                  </MenuItem>
                ))}
              </CustomSelect>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleAddTabs} color="primary">
              Add Tabs
            </Button>
          </DialogActions>
        </CustomDialog>



        </Grid>
      </Grid>
    );
  };
  
  export default Dashboard;
