import React, { useState, useEffect } from 'react';
import { Tag } from '../../models/Tag';
import { TypedTaggedObject } from './TypedTaggedObject';
import tagService from '../../services/tagService';
import taskService from '../../services/taskService';
import goalService from '../../services/goalService';
import noteService from '../../services/noteService';
import { StrapiServiceResponse } from '../../types/StrapiServiceResponse';
import { Task, TaskStatus } from '../../models/Task';
import { Goal } from '../../models/Goal';
import UnifiedObjectsList from './UnifiedObjectsList';
import TagSelect from '../TagSelect';
import { Container, Typography, Button, Box, Grid, Modal, Backdrop, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface UnifiedFilterProps {
  keycloakSubject: string | undefined;
  goal?: Goal | undefined;
  refresh?: boolean;
  addTaskButton?: React.ReactNode;
}

const UnifiedFilter: React.FC<UnifiedFilterProps> = ({ keycloakSubject, goal, refresh, addTaskButton }) => {
  const [taggedObjects, setTaggedObjects] = useState<TypedTaggedObject[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags();
  }, [keycloakSubject, refresh, goal]);

  const fetchTags = async () => {
    const response: StrapiServiceResponse<Tag[]> = await tagService.getAll(keycloakSubject);
    if (response.data) {
      setTags(response.data);
    }
  };

  const handleObjectStatusChange = async (id: string | undefined, newStatus: string) => {   

  }

  const handleTagSelection = async (selectedTags: Tag[]) => {
    setTaggedObjects([]); // Clear the current objects
  
    if (selectedTags.length > 0) {
      const tasksResponse = await taskService.getByTags(selectedTags, true);
      const goalsResponse = await goalService.getByTags(selectedTags);
      const notesResponse = await noteService.getByTags(selectedTags);
      // Fetch notes and assessments by tags
      
      // Check for null before spreading and add the 'type' property
      const tasksData = tasksResponse.data ? tasksResponse.data.map(task => ({ ...task, type: 'Task' as const })) : [];
      const goalsData = goalsResponse.data ? goalsResponse.data.map(goal => ({ ...goal, type: 'Goal' as const })) : [];
      const notesData = notesResponse.data ? notesResponse.data.map(note => ({ ...note, title: note.name, type: 'Note' as const })) : [];

      setTaggedObjects([...tasksData, ...goalsData, ...notesData, /* ...assessments.data*/]);
    }
  };
  


  // You will need to implement deleteObject and handleObjectStatusChange methods
  // similar to deleteTask and handleTaskStatusChange in your original TasksFilter component

  return (
    <Box paddingTop={2}>
      <TagSelect tags={tags} onSelectionChange={handleTagSelection} />
      <UnifiedObjectsList
        objects={taggedObjects}
        onObjectStatusChange={handleObjectStatusChange}
        previousRoute={goal ? `/update-goal/${goal.id}` : '/create-task'}
        addTaskButton={addTaskButton}
      />
    </Box>
  );
};

export default UnifiedFilter;
