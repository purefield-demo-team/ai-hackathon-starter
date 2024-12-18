// src/components/CreateNote.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFetchData } from '../hooks/useFetchData';
import noteService from '../services/noteService';
import { useUserProfile } from '../contexts/UserProfileContext';
import { Note } from '../models/Note';
import { useKeycloak } from "@react-keycloak/web";
import { Tag } from '../models/Tag';
import NotesFilter from './NotesFilter';
import { NoteTagInput } from './NoteTagInput';
import TaskSelector from './TaskSelector';
import { Container, Typography, Grid, Button, Box, CircularProgress } from '@mui/material';
import NoteForm from './NoteForm';
import {Task} from '../models/Task';
import { useTasks } from '../contexts/TaskContext';
import TaskService from '../services/taskService';
import taskService from '../services/taskService';
import TaskNoteService from '../services/taskNoteService';
import { TaskNote } from '../models/TaskNote';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';

interface LocationState {
  previousRoute?: string;
}


const CreateNote: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [richText, setRichText] = useState('');
  const [id, setId] = useState<number | undefined>(undefined);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const { selectedTasks, setSelectedTasks } = useTasks(); // use Tasks from TaskContext
  const [allTasks, setAllTasks] = useState<Task[]>([]); 
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localISOTime = (new Date(today.getTime() - (offset * 60 * 1000))).toISOString().slice(0,-1);
  const [recordedAt, setRecordedAt] = useState<string | undefined>(localISOTime.substring(0,16));
  const { keycloak } = useKeycloak();
  const { userProfile, setUserProfile } = useUserProfile();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  

  const note: Note = {
    id,
    name: name || `Untitled-${id}`,
    richText,
    recordedAt: recordedAt || undefined,
    userProfile: userProfile || undefined,
    tags,
  };

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
    // Trigger this effect when id is set (i.e., when note is created)
    const fetchTasksByNoteId = async () => {
      if (!id) return;
      const response = await TaskNoteService.getByNoteId(id); // Replace 'true' with the appropriate 'showCompleted' value
      if (response.error) {
        console.error("Error fetching tasks by note id:", response.error);
        return;
      }
      if (response.data) {
        // Here we map over the TaskNote array to extract the Task objects only
        const mappedTasks = response.data.map(taskNote => taskNote.task);
        setSelectedTasks(mappedTasks);  // update selectedTasks in the TaskContext
      }
      
    };
  
    fetchTasksByNoteId();
  }, [id]);
  
  useEffect(() => {
    const createTaskNoteAssociations = async () => {
      if (!id) return; // If note id is not set, return

      const currentAssociationsResponse = await TaskNoteService.getByNoteId(id);
      if (currentAssociationsResponse.error) {
        console.error("Error fetching task-note associations:", currentAssociationsResponse.error);
        return;
      }
      const currentAssociations = currentAssociationsResponse.data || [];

      for (const task of selectedTasks) {
        const existingAssociation = currentAssociations.find(association => association.task.id === task.id);
        if (existingAssociation) continue;

        const newAssociation: TaskNote = { 
          task: task, 
          note: note // Provide full note object
        };
        const createResponse = await TaskNoteService.create(newAssociation);
        if (createResponse.error) {
          console.error("Error creating task-note association:", createResponse.error);
          continue;
        }
        // Use an intermediate variable to help TypeScript infer the types correctly
        const taskFromResponse = createResponse.data?.task;
        if (taskFromResponse) {
          setSelectedTasks(prevTasks => [...prevTasks, taskFromResponse]); // Add newly associated Task to selectedTasks state
        }
      }
    };

    createTaskNoteAssociations();
  }, [selectedTasks, id, note]); // note added to dependency list

  
  

   // This effect runs when name or richText change, triggering auto-save
   useEffect(() => {
    if (!autoSave) return;
    // Clear the previous timeout if it exists
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const saveNote = async () => {
        setIsSaving(true);
        let response;
        if (!id) {
          response = await noteService.create(note);
          if (response.data && response.data.id) {
          
            setId(response.data.id);
            setIsSaving(false);
            if (!name) {
              setName(`Untitled-${response.data.id}`); // set the name if it's not set
            }
          }
        } else {
          response = await noteService.update(id.toString(), note);
          setIsSaving(false);
        }
        if (!response.data) {
          // Handle error
          console.error("Error saving note");
          setIsSaving(false);
        }
        else{
          setSaveMessage('All changes saved');
          setTimeout(() => setSaveMessage(''), 3000); 
        }
        setIsSaving(false);
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
  }, [name, richText, tags, recordedAt]);
  

  const handleFormChange = (field: keyof Note, value: any) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'richText':
        setRichText(value);
        break;
      case 'recordedAt':
        
        setRecordedAt(value);
        break;
    }
  };

  const handleTagsChange = (tags: Tag[]) => {
    setTags(tags);
  };

  // const handleSubmit = async (event: React.FormEvent) => {
  //   event.preventDefault();

  //   if (!userProfile) {
  //     return;
  //   }

  //   const response = await noteService.create(note);

  //   if (response.data) {
  //     setName('');
  //     setRichText('');
  //     setRecordedAt(undefined);
  //   }
  // };

  const handleGoBack = () => {
    const previousRoute = (location.state as LocationState)?.previousRoute;
    if (previousRoute) {
      navigate(previousRoute);
    } else {
      navigate(-1); // Fallback to navigate back in history if previousRoute is not available
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    //setAutoSave(true); // Start auto-saving when user submits the form for the first time
  };

  return (
    
      <Grid container>
        <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
          <NotesFilter keycloakSubject={userProfile?.keycloaksubject} />
        </Grid>
        <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
          <Typography variant="h4" gutterBottom>Create Note</Typography>
          
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
            note={{ name, richText, recordedAt }}
            onSubmit={handleSubmit}
            onChange={handleFormChange}
          >
            <Grid container justifyContent="space-between" alignItems="center" mt={2}>
              <Box paddingTop={1} style={{ width: '100%' }}>
                <TaskSelector 
                  tasks={allTasks} 
                  preSelectedTasks={selectedTasks} 
                  onSelectionChange={setSelectedTasks} 
                />
              </Box>
            </Grid>
          </NoteForm>
          <div>&nbsp;</div>
          <NoteTagInput note={note} keycloakSubject={userProfile?.keycloaksubject} onTagsChange={handleTagsChange} />
          <Grid container justifyContent="space-between" alignItems="center" mt={2}>
            <Grid item>
             
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={handleGoBack}>Previous</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
  
  );
};

export default CreateNote;
