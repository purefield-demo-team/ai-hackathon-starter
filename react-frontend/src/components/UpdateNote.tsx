import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import noteService from '../services/noteService';
import { Note } from '../models/Note';
import { useUserProfile } from '../contexts/UserProfileContext';
import NoteForm from './NoteForm';
import { Tag } from '../models/Tag';
import { NoteTagInput } from './NoteTagInput';
import NotesFilter from './NotesFilter';
import { useTasks } from '../contexts/TaskContext';
import TaskSelector from '../components/TaskSelector';
import { Task } from '../models/Task';
import { Container, Typography, Button, Box, Grid, CircularProgress } from '@mui/material';
import '../App.css';
import taskService from '../services/taskService';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import taskNoteService from '../services/taskNoteService';
import { TaskNote } from '../models/TaskNote';

interface LocationState {
  previousRoute?: string;
}

const UpdateNote: React.FC = () => {
  const location = useLocation();
  const { id } = useParams();
  const [tags, setTags] = useState<Tag[]>([]);
  const navigate = useNavigate();
  const [note, setNote] = useState<Note| null>(null);
  const { userProfile, setUserProfile } = useUserProfile();
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [preSelectedTasksLoading, setPreselectedTasksLoading] = useState(true);
  const [preSelectedTasks, setPreSelectedTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [taskNotes, setTaskNotes] = useState<TaskNote[]>([]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      const response = await noteService.get(id);
      if(response && response.data)
      {
        if(!response.data.tags)
        {
          response.data.tags = [];
        }
      }
  
      setNote(response.data ?? null);
      setTags(response.data?.tags ?? []);
    };
  
    fetchNote();
  }, [id]);

  const handleTaskSelection = useCallback(async (selectedTasks: Task[]) => {
    const selectedTaskIds = selectedTasks.map(task => task.id);
    const preselectedTaskIds = taskNotes.map(taskNote => taskNote.task.id);
  
    const addedTasks = selectedTasks.filter(task => !preselectedTaskIds.includes(task.id));
    const removedTasks = taskNotes.filter(taskNote => !selectedTaskIds.includes(taskNote.task.id));
  
    // Handle added tasks
    if(note !== null) {
      for (const addedTask of addedTasks) {
        // Check if the task is already in the list
        const existingTask = taskNotes.find(taskNote => taskNote.task.id === addedTask.id);
        
        // If task does not exist in the list, then add it
        if (!existingTask) {
          const taskNote: TaskNote = {
            task: addedTask,
            note: note,
          };
  
          const response: StrapiServiceResponse<TaskNote> = await taskNoteService.create(taskNote);
          if (response.data) {
            setTaskNotes((prevTaskNotes: TaskNote[]) => [...prevTaskNotes, response.data as TaskNote]);
          }
        }
      }
    }
  
    // Handle removed tasks
    for (const removedTask of removedTasks) {
      await taskNoteService.delete(removedTask.id);
      setTaskNotes(prevTaskNotes => prevTaskNotes.filter(taskNote => taskNote.task.id !== removedTask.task.id));
    }
  }, [note, taskNotes, taskNoteService.create, taskNoteService.delete]);  
  

  const handleUpdate = async () => {
    if (!note) return;

    await noteService.update(id, note);
    setIsSaving(false);
    setSaveMessage('All changes saved');
    setTimeout(() => setSaveMessage(''), 3000); 
    // Handle successful update, e.g., show a success message or redirect
  };


  useEffect(() => {
    if (!autoSave) return;
    // Clear the previous timeout if it exists
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const saveNote = async () => {
        setIsSaving(true);
        
        handleUpdate();
      
      };
      saveNote();
      // Clear the timeout reference after saving
      debounceTimeoutRef.current = null;
    }, 1000); // Debounce delay in milliseconds (adjust as needed)

     // Cleanup function to clear timeout on unmount
     return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [note, tags]);

  useEffect(() => {
    // Fetch all tasks on component mount
    const fetchAllTasks = async () => {
      const taskResponse: StrapiServiceResponse<Task[]> = await taskService.getAll(userProfile?.keycloaksubject, true);
      if (taskResponse.error) {
        console.error("Error fetching all tasks:", taskResponse.error);
        return;
      }
      const allTasks = taskResponse.data || [];
      setAllTasks(allTasks);
    };
    
  
    fetchAllTasks();
  }, [userProfile?.keycloaksubject]);
  
  useEffect(() => {
    const fetchTaskNotes = async () => {
      setPreselectedTasksLoading(true);
      const response = await taskNoteService.getByNoteId(Number(id));
      if (!response.error && response.data !== null) {
        setTaskNotes(response.data);
        const preSelected = response.data.map(taskNote => taskNote.task);
        setPreSelectedTasks(preSelected);
        setPreselectedTasksLoading(false);
      } else {
        console.log(response.error);
      }
    };
    fetchTaskNotes();
  }, [id]);
  

  const handleTagsChange = (tags: Tag[]) => {
    if(note)
    {
      setNote({ ...note, tags: tags });
    }
      
  };

  const handleFormChange = (field: keyof Note, value: any) => {
    if (!note) return;
  
    setNote((prevState) => ({
      ...(prevState as Note),
      [field]: value,
    }));
  };
  
  const handleGoBack = () => {
    const previousRoute = (location.state as LocationState)?.previousRoute;
    if (previousRoute) {
      navigate(previousRoute);
    } else {
      navigate(-1); // Fallback to navigate back in history if previousRoute is not available
    }
  };

  if (!note) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container>
        <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
          <NotesFilter keycloakSubject={userProfile?.keycloaksubject} />
        </Grid>
        <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
          <Typography variant="h4" gutterBottom>Update Note</Typography>
          {note && note.tags ? (
            <NoteTagInput
              note={note}
              keycloakSubject={userProfile?.keycloaksubject}
              onTagsChange={handleTagsChange}
            />
          ) : null}
          {/* Display saving indicator or saved message */}
          {(isSaving || saveMessage) && (
            <Box display="flex" alignItems="center" mb={2}>
              {isSaving ? (
                <>
                  <CircularProgress size={20} />
                  <Typography variant="body2" ml={1}>
                    Saving...
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="green">
                  {saveMessage}
                </Typography>
              )}
            </Box>
          )}
          <NoteForm
            note={ note }
            onSubmit={handleUpdate}
            onChange={handleFormChange}
          >
           {(!preSelectedTasksLoading) && ( <Grid container justifyContent="space-between" alignItems="center" mt={2}>
              <Box paddingTop={1} paddingBottom={1} style={{ width: '100%' }}> {/* 2 corresponds to 20px when the default theme spacing is used */}
                <TaskSelector 
                  tasks={allTasks} 
                  preSelectedTasks={preSelectedTasks} 
                  onSelectionChange={handleTaskSelection} 
                />
              </Box>
              <Grid item>
                <Button variant="contained" color="secondary" onClick={handleGoBack}>Previous</Button>
              </Grid>
              
            </Grid>
           )}
        </NoteForm>
      </Grid>
    </Grid>
  );
};

export default UpdateNote;
