import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import taskService from '../services/taskService';
import { Task, TaskStatus } from '../models/Task';
import TaskForm from './TaskForm';
import goalTaskService from '../services/goalTaskService';
import goalService from '../services/goalService';
import { Goal } from '../models/Goal';
import { GoalTask } from '../models/GoalTask';
import { useFetchData } from "../hooks/useFetchData";
import { useUserProfile } from '../contexts/UserProfileContext';
import { TagInput } from './TagInput';
import { Tag } from '../models/Tag';
import { TaskNote } from '../models/TaskNote';
import TasksFilter from './TasksFilter';
import { Container, Typography, Button, Box, Grid, CircularProgress } from '@mui/material';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import taskNoteService from '../services/taskNoteService';
import NoteSelector from './NoteSelector';
import noteService from '../services/noteService';
import {Note} from '../models/Note';
import AssessmentList from './AssessmentList';
import { useTasks } from '../contexts/TaskContext';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import '../App.css';

interface LocationState {
  previousRoute?: string;
}

const UpdateTask: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const location = useLocation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [taskNotes, setTaskNotes] = useState<TaskNote[]>([]);
  const [preSelectedNotesLoading, setPreselectedNotesLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshFilter, setRefreshFilter] = useState(false);
  const { selectedTasks, setSelectedTasks } = useTasks();
  const [isPrepopulated, setIsPrepopulated] = useState(true);
  const [preSelectedNotes, setPreSelectedNotes] = useState<Note[]>([]);
  
  const { userProfile, setUserProfile } = useUserProfile();

  const handleNoteSelection = useCallback(async (selectedNotes: Note[]) => {
    const selectedNoteIds = selectedNotes.map(note => note.id);
    const preselectedNoteIds = taskNotes.map(taskNote => taskNote.note.id);
  
    const addedNotes = selectedNotes.filter(note => !preselectedNoteIds.includes(note.id));
    const removedNotes = taskNotes.filter(taskNote => !selectedNoteIds.includes(taskNote.note.id));
  
    // Handle added notes
    if(task !== null) {
      for (const addedNote of addedNotes) {
        // Check if the note is already in the list
        const existingNote = taskNotes.find(taskNote => taskNote.note.id === addedNote.id);
        
        // If note does not exist in the list, then add it
        if (!existingNote) {
          const taskNote: TaskNote = {
            note: addedNote,
            task: task,
          };
  
          const response: StrapiServiceResponse<TaskNote> = await taskNoteService.create(taskNote);
          if (response.data) {
            setTaskNotes((prevTaskNotes: TaskNote[]) => [...prevTaskNotes, response.data as TaskNote]);
          }
        }
      }
    }
  
    // Handle removed notes
    for (const removedNote of removedNotes) {
      await taskNoteService.delete(removedNote.id);
      setTaskNotes(prevTaskNotes => prevTaskNotes.filter(taskNote => taskNote.note.id !== removedNote.note.id));
    }
  }, [task, taskNotes, taskNoteService.create, taskNoteService.delete]);  

  useEffect(() => {
    const fetchTask = async () => {
      const response = await taskService.get(id);
      if (response.data) {
        setTask(response.data);
        setTags(response.data.tags); // Update tags state with the fetched task's tags
      } else {
        // Handle the case when response.data is null
        console.error('Task not found');
        // You can add additional error handling logic here if needed
      }
    };
  
    fetchTask();
  }, [id]);
  
  useEffect(() => {
    const fetchNotes = async () => {
      const response: StrapiServiceResponse<Note[]> = await noteService.getAll(userProfile?.keycloaksubject);
      if (!response.error && response.data !== null) {
        setNotes(response.data);
      } else {
        // handle error
        console.log(response.error);
      }
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    setTask((prevTask) => {
      if (!prevTask) return null;
      return {
        ...prevTask,
        tags: tags,
      };
    });
  }, [tags]);

  useEffect(() => {
    const fetchTaskNotes = async () => {
      setPreselectedNotesLoading(true);
      const response = await taskNoteService.getByTaskId(id);
      if (!response.error && response.data !== null) {
        setTaskNotes(response.data);
        const preSelected = response.data.map(taskNote => taskNote.note);
        setPreSelectedNotes(preSelected);
        setPreselectedNotesLoading(false);
      } else {
        console.log(response.error);
      }
    };
    fetchTaskNotes();
  }, [id]);
  
  useEffect(() => {
    setRefreshFilter(false); // Reset the refreshFilter state variable
  }, [refreshFilter]);
  

  const fetchFunction = goalService.getAll;
  const {
    data: goals,
    error: goalsError,
    isLoading: goalsLoading,
    refresh, // Destructure the refresh function from useFetchData
  } = useFetchData<Goal, [string | undefined]>(goalService.getAll, userProfile?.keycloaksubject);

  const [goalTasks, setGoalTasks] = useState<GoalTask[] | null>(null);  

  useEffect(() => {
    const fetchGoalTasks = async () => {
      const response = await goalTaskService.getByTaskId(id);
      setGoalTasks(response.data);
    };

    fetchGoalTasks();
  }, [id]);

  useEffect(() => {
    if (goals && goalTasks) {
      setIsDataLoaded(true);
    }
  }, [goals, goalTasks]);
  

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!task) return;

    await taskService.update(id, task);

    // Handle successful update, e.g., show a success message or redirect
    setRefreshFilter(true);
  };

  const handleFormChange = (field: keyof Task, value: any) => {
    if (!task) return;
  
    setTask((prevState) => ({
      ...(prevState as Task),
      [field]: value,
    }));
  };

  const handleGoalsChange = async (selectedGoals: Goal[]) => {
    if(goalTasks != null)
    {
      const newGoalIds = selectedGoals.map((goal) => goal.id!);
      const oldGoalIds = goalTasks.map((goalTask) => goalTask.goal.id!);
    
      const goalsToAssociate = selectedGoals.filter((goal) => !oldGoalIds.includes(goal.id!));
      const goalsToDisassociate = goalTasks.filter(
        (goalTask) => !newGoalIds.includes(goalTask.goal.id!)
      );
    
      for (const goal of goalsToAssociate) {
        await goalTaskService.create({ goal, task: task! });
      }
    
      for (const goalTask of goalsToDisassociate) {
        await goalTaskService.delete(goalTask.id);
      }
    
      // Update the goalTasks state
      const updatedGoalTasks = goalTasks.filter((goalTask) =>
        newGoalIds.includes(goalTask.goal.id!)
      );
      setGoalTasks([...updatedGoalTasks, ...goalsToAssociate.map((goal) => ({ goal, task: task! }))]);
    }
    
  };
  
  const handleGoBack = () => {
    const previousRoute = (location.state as LocationState)?.previousRoute;
    if (previousRoute) {
      navigate(previousRoute);
    } else {
      navigate(-1); // Fallback to navigate back in history if previousRoute is not available
    }
  };

  if (!task) {
    return <div>Loading...</div>;
  }

  const handleTagsChange = (tags: Tag[]) => {
    if (!task) return;
  
    setTask((prevTask: Task | null): Task | null => {
      if (!prevTask) return null;
  
      return {
        ...prevTask,
        tags: tags,
      };
    });
  };

  const handleAddNote = () => {
    // Add the current task to the selectedTasks state if it's not already there
    setSelectedTasks((prevSelectedTasks) => {
      if (!prevSelectedTasks.some(prevTask => prevTask.id === task.id)) {
        return [...prevSelectedTasks, task];
      } else {
        return prevSelectedTasks;
      }
    });
    
    // Navigate to the create-note route
    navigate("/create-note");
  };
  

  function isTaskNote(data: any): data is TaskNote {
    return data && data.id !== undefined && typeof data.id === 'number';
  }
  

  return (
    <Grid container>
      <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
        <TasksFilter keycloakSubject={userProfile?.keycloaksubject} refresh={refreshFilter} />
      </Grid>
      <Grid item xs={12} sm={4} md={4} lg={8} className="main-content">
        
        <Typography variant="h4" gutterBottom>Update Task</Typography>
        {isDataLoaded ? <TaskForm
          task={task}
          goals={goals}
          goalTasks={goalTasks}
          onSubmit={handleUpdate}
          onChange={handleFormChange}
          onGoalsChange={handleGoalsChange}
          showGoalsDropdown={true}
        >
          <TagInput task={task} onTagsChange={handleTagsChange} userProfile={userProfile} />
          {(!preSelectedNotesLoading) && (
            <Grid container direction="row" alignItems="center">
              <Grid item xs>
                <NoteSelector 
                  notes={notes} 
                  preSelectedNotes={preSelectedNotes} 
                  onSelectionChange={handleNoteSelection} 
                />
              </Grid>
              <Box p={1} /> {/* this will create a padding */}
              <Grid item>
                <Button variant="contained" color="primary" onClick={handleAddNote}>
                  Add Note
                </Button>
              </Grid>
            </Grid>
          
          )}

          <Grid container justifyContent="space-between" alignItems="center" mt={2}>
            <Grid item>
              <Button variant="contained" color="secondary" type="submit">Update Task</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={handleGoBack}>Previous</Button>
            </Grid>
          </Grid>
        </TaskForm>  
         : <CircularProgress />}
        
       
      </Grid>
      <Grid item xs={12} sm={4} md={4} lg={2} className="right-sidebar">
        {userProfile && isDataLoaded ? <AssessmentList taskId={task.id}/> : <CircularProgress />}
      </Grid>
      
    </Grid>
  );

};

export default UpdateTask;
