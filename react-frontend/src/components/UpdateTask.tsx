import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Container, Typography, Button, Box, Grid, CircularProgress, Modal, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import taskNoteService from '../services/taskNoteService';
import NoteSelector from './NoteSelector';
import noteService from '../services/noteService';
import {Note} from '../models/Note';
import gptAssessmentService from '../services/gptAssessmentService';
import { GPTAssessment } from '../models/GPTAssessment';
import { useTasks } from '../contexts/TaskContext';
import ReactMarkdown from 'react-markdown';
import { IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReferenceSelector from './ReferenceSelector';
import userDataSourceService from '../services/userDataSourceService';
import taskDataSourceService from '../services/taskDataSourceService';
import { UserDataSource } from '../models/UserDataSource';
import { TaskDataSource } from '../models/TaskDataSource';
import DataSourceSelector from './datasources/DataSourceSelector';
import AddIcon from '@mui/icons-material/Add';
import "./circularProgress.css";
import rehypeRaw from 'rehype-raw';
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
  const [userDataSources, setUserDataSources] = useState<UserDataSource[]>([]);
  const [refreshFilter, setRefreshFilter] = useState(false);
  const { selectedTasks, setSelectedTasks } = useTasks();
  const [isPrepopulated, setIsPrepopulated] = useState(true);
  const [preSelectedNotes, setPreSelectedNotes] = useState<Note[]>([]);
  const [initialAssessmentIds, setInitialAssessmentIds] = useState<number[]>([]);
  const [isChatAccordionOpen, setIsChatAccordionOpen] = useState(true);

  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [latestAssessment, setLatestAssessment] = useState<GPTAssessment | null>(null);
  const [displayedAssessment, setDisplayedAssessment] = useState<string>('');
  const typingTimeoutRef = useRef<number | null>(null);
  const previousAssessmentIdRef = useRef<number | null | undefined>(null);
  const previousAssessmentContentRef = useRef<string | null>(null);

  const [isAssessmentVisible, setIsAssessmentVisible] = useState(true);

  const [taskDataSource, setTaskDataSource] = useState<TaskDataSource | null>(null);

  
  const { userProfile, setUserProfile } = useUserProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<GPTAssessment | null>(null);

  const [settingsExpanded, setSettingsExpanded] = useState<boolean>(false);

  const handleSettingsAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setSettingsExpanded(isExpanded);
  };

  const openModal = (assessment: GPTAssessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setSelectedAssessment(null);
    setIsModalOpen(false);
  };

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

  const type = (text: string, index: number) => {
    const totalDuration = 5000; // Set total duration to 50 milliseconds
    const interval = 16; // Frame interval
    const totalChars = text.length;
  
    const charsPerInterval = Math.ceil((totalChars * interval) / totalDuration);
  
    if (index < totalChars) {
      const nextIndex = Math.min(index + charsPerInterval, totalChars);
      setDisplayedAssessment(text.substring(0, nextIndex));
      typingTimeoutRef.current = window.setTimeout(() => type(text, nextIndex), interval);
    } else {
      setDisplayedAssessment(text);
      typingTimeoutRef.current = null;
    }
  };
  

  useEffect(() => {
    if (latestAssessment && latestAssessment.assessment) {
      setIsAssessmentVisible(true);
      const latestContent = latestAssessment.assessment;

      const previousContent = previousAssessmentContentRef.current;
  
      if (previousContent === null) {
        // Initial load, display assessment immediately
        setDisplayedAssessment(latestContent);
      } else if (latestContent !== previousContent) {
        // New assessment detected, trigger typing effect
        setDisplayedAssessment(''); // Reset displayed assessment
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        type(latestContent, 0); // Start typing emulation
      }
      // Update the ref with the latest content
      previousAssessmentContentRef.current = latestContent;
    }
  }, [latestAssessment]);
  
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleClearAssessment = () => {
    setIsAssessmentVisible(false);
    setDisplayedAssessment('');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };  
  
  const addReferences = () => {
    const references = latestAssessment?.messageChunks;
    if (!references) return;
  
    const referencesText = references.map((ref, index) => {
      return `${index + 1}.`;
    });
  
    return referencesText.join('\n');
  };
  
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


  // Fetch the existing TaskDataSource for the task
  useEffect(() => {
    const fetchTaskDataSource = async () => {
      const response = await taskDataSourceService.getByTaskId(id);
      if (!response.error && response.data !== null) {
        setTaskDataSource(response.data[0]);
      } else {
        setTaskDataSource(null);
      }
    };
    fetchTaskDataSource();
  }, [id]);

  useEffect(() => {
    const fetchUserDataSources = async () => {
      const response: StrapiServiceResponse<UserDataSource[]> = await userDataSourceService.getAll(userProfile?.keycloaksubject);
      if (!response.error && response.data !== null) {
        setUserDataSources(response.data);
      } else {
        // handle error
        console.log(response.error);
      }
    };
    fetchUserDataSources();
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
    const fetchAssessments = async () => {
      if (!task || !userProfile?.keycloaksubject) return;
  
      const taskFilter = task.id ? `&filters[tasks][id][$in]=${task.id}` : '';
  
      const response = await gptAssessmentService.getAll(
        userProfile.keycloaksubject + taskFilter,1
      );
  
      if (response.data && response.data.length > 0) {
        // Set the latestAssessment to the first item in the array
        setLatestAssessment(response.data[0]);
        // Store the IDs of the assessments
        setInitialAssessmentIds(
          response.data
            .map(a => a.id)
            .filter((id): id is number => id !== undefined)
        );
        
      } else {
        setLatestAssessment(null);
        // No initial assessments
        setInitialAssessmentIds([]);
      }
    };
  
    fetchAssessments();
  }, [task, userProfile]);
  

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
  
  const pollAssessmentStatus = async (existingAssessmentIds: number[]) => {
    const pollInterval = 5000; // Poll every 5 seconds
    const maxAttempts = 12; // Maximum number of attempts (1 minute)
  
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Fetch assessments associated with the task
        const taskFilter = task && task.id ? `&filters[tasks][id][$in]=${task.id}` : '';
        const response = await gptAssessmentService.getAll(
          userProfile?.keycloaksubject + taskFilter, 1
        );
  
        if (response.data && response.data.length > 0) {
          // Filter out assessments with undefined IDs
          const assessmentsWithIds = response.data.filter(
            a => a.id !== undefined
          ) as GPTAssessment[]; // Type assertion
  
          // Find assessments that are not in existingAssessmentIds
          const newAssessments = response.data.filter(
            a => a.id !== undefined && !existingAssessmentIds.includes(a.id)
          );
  
          if (newAssessments.length > 0) {
            const latest = newAssessments[0]; // Assuming the first is the latest
  
            if (latest.assessment) {
              // The assessment field is populated
              setLatestAssessment(latest);
              setIsCreatingAssessment(false);
              return;
            } else {
              // Assessment exists but assessment field not populated yet
              // Continue polling
            }
          }
        }
      } catch (error) {
        console.error('Error polling assessment status:', error);
      }
  
      // Wait for the next poll interval
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  
    // If the assessment is still not populated after max attempts, stop the spinner
    setIsCreatingAssessment(false);
    console.error('Assessment was not populated within the expected time.');
  };  

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!task || !userProfile) return;
  
    // Start loading animation
    setIsCreatingAssessment(true);
    setIsChatAccordionOpen(false);
  
    // Fetch the current assessments and store their IDs
    let currentAssessmentIds: number[] = [];
    try {
      const taskFilter = task.id ? `&filters[tasks][id][$in]=${task.id}` : '';
      const response = await gptAssessmentService.getAll(
        userProfile.keycloaksubject + taskFilter,1
      );
      if (response.data && response.data.length > 0) {
        currentAssessmentIds = response.data
          .filter(a => a.id !== undefined)
          .map(a => a.id as number);
      }
      
    } catch (error) {
      console.error('Error fetching current assessments:', error);
    }
  
    // Update the task
    try {
      await taskService.update(id, task);
    } catch (error) {
      console.error('Error updating task:', error);
      setIsCreatingAssessment(false);
      return;
    }
  
    try {
      // Poll the assessment status until it is populated
      await pollAssessmentStatus(currentAssessmentIds);
    } catch (error) {
      console.error('Error polling assessment:', error);
      setIsCreatingAssessment(false);
    }
  };
   
  // Handle DataSource selection
  const handleDataSourceSelection = useCallback(
    async (selectedUserDataSource: UserDataSource) => {
      if (!task || !userProfile) return;

      if(taskDataSource != null && taskDataSource.dataSource != null && taskDataSource.dataSource.id != null && selectedUserDataSource.dataSource.id == taskDataSource.dataSource.id)
      {
        taskDataSourceService.delete(taskDataSource.id);
        setTaskDataSource(null);
        return;
      } 
      // Delete existing TaskDataSource (if any)
      if (taskDataSource) {
        await taskDataSourceService.delete(taskDataSource.id);
      }

      // Create new TaskDataSource
      const newTaskDataSource: TaskDataSource = {
        task: task,
        dataSource: selectedUserDataSource.dataSource,
        taskDataSourceId: task.id + '-'+ selectedUserDataSource.dataSource.id,
      };

      const response = await taskDataSourceService.create(newTaskDataSource);
      if (!response.error && response.data) {
        setTaskDataSource(response.data);
      } else {
        console.error('Error creating TaskDataSource:', response.error);
      }
    },
    [task, taskDataSource, userProfile]
  );

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
      <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
        <Typography variant="h4" gutterBottom>Update Task</Typography>
        <Accordion expanded={settingsExpanded} onChange={handleSettingsAccordionChange}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="settings-content"
            id="settings-header"
          >
            <Typography>Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
        
          <TagInput task={task} onTagsChange={handleTagsChange} userProfile={userProfile} />
          <Grid container direction="row" alignItems="center">
            <Grid item xs>
              <DataSourceSelector
              userDataSources={userDataSources}
              currentDataSourceId={taskDataSource?.dataSource?.id || null}
              onDataSourceSelect={handleDataSourceSelection}
              />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        {isDataLoaded ? <TaskForm
          task={task}
          goals={goals}
          goalTasks={goalTasks}
          onSubmit={handleUpdate}
          onChange={handleFormChange}
          onGoalsChange={handleGoalsChange}
          isChatAccordionOpen={isChatAccordionOpen}
          setIsChatAccordionOpen={setIsChatAccordionOpen}
          showGoalsDropdown={true}
        >
          
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

          {isCreatingAssessment ? (
            <div className="loader-container">
              <CircularProgress />
            </div>
          ) : latestAssessment && isAssessmentVisible ? (
            <Box
              sx={{
                backgroundColor: '#34473f',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px',
                position: 'relative',
              }}
            >
              {/* Close IconButton */}
              <IconButton
                aria-label="close"
                onClick={handleClearAssessment}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Refresh IconButton */}
              <IconButton
                aria-label="refresh"
                onClick={handleUpdate}
                sx={{
                  position: 'absolute',
                  right: 48,
                  top: 8,
                  color: 'white',
                }}
              >
                <RefreshIcon />
              </IconButton>

              {/* Rest of your content */}
              <Typography variant="h6" style={{ color: 'white' }}>
                Response
              </Typography>
              <Typography
                variant="body1"
                style={{ cursor: 'pointer', color: 'white' }}
              >
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{displayedAssessment}</ReactMarkdown>
              </Typography>

              {/* References */}
              {latestAssessment.messageChunks && latestAssessment.messageChunks.length > 0 && (
                <ReferenceSelector messageChunks={latestAssessment.messageChunks} />
              )}
            </Box>

          ) : (
            <Typography variant="body1">No assessment available.</Typography>
          )}



          <Grid container justifyContent="space-between" alignItems="center" mt={2}>
            <Grid item>
              <Button variant="contained" color="secondary" type="submit">Submit</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={handleGoBack}>Previous</Button>
            </Grid>
          </Grid>
        </TaskForm>  
         : <CircularProgress />}
        
       
      </Grid>
      <Modal
        open={isModalOpen}
        onClose={closeModal}
      >
        <Box sx={{ padding: 2, backgroundColor: 'white', margin: 'auto', maxWidth: '80vw', maxHeight: '80vh', overflow: 'auto' }}>
          <Typography variant="h6">Assessment Details</Typography>
          <Typography variant="body1"><ReactMarkdown>{selectedAssessment?.assessment}</ReactMarkdown></Typography>
          {/* Display additional assessment details if needed */}
          <Button onClick={closeModal} variant="contained" color="primary" sx={{ marginTop: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Grid>
    
  );

};

export default UpdateTask;