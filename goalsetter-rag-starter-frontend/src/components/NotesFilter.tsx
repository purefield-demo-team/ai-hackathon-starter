import React, { useState, useEffect } from 'react';
import { Tag } from '../models/Tag';
import tagService from '../services/tagService';
import noteService from '../services/noteService';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { Note } from '../models/Note';
import CreatedNotesList from './CreatedNotesList';
import TagSelect from './TagSelect';
import Box from '@mui/material/Box';
import taskNoteService from '../services/taskNoteService';

interface NotesFilterProps {
  keycloakSubject: string | undefined;
}

const NotesFilter: React.FC<NotesFilterProps> = ({ keycloakSubject }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState<Note[] | null>(null);

  const fetchNotes = async () => {
    const response: StrapiServiceResponse<Note[]> = await noteService.getAll(keycloakSubject);
    if (response.data) {
      setNotes(response.data);
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      const response: StrapiServiceResponse<Tag[]> = await tagService.getAll(keycloakSubject);
      if (response.data) {
        setTags(response.data);
      }
    };

    fetchTags();
    fetchNotes();
  }, [keycloakSubject]);

  const handleTagSelection = async (selectedTags: Tag[]) => {
    if (selectedTags.length === 0) {
      fetchNotes();
    } else {
      const response: StrapiServiceResponse<Note[]> = await noteService.getByTags(selectedTags);
      if (response.data) {
        setNotes(response.data);
      }
    }
  };

  const deleteNote = async (id: number | undefined): Promise<boolean> => {
    if (id) {
      // Get all TaskNotes for this Note
      const taskNoteResponse = await taskNoteService.getByNoteId(id);
      if (taskNoteResponse.data) {
        // Delete all TaskNotes for this Note
        for (const taskNote of taskNoteResponse.data) {
          const taskNoteDeleteResult = await taskNoteService.delete(taskNote.id);
          if (taskNoteDeleteResult.error) {
            alert(`Error deleting TaskNote: ${taskNoteDeleteResult.error.statusText}`);
            return false;
          }
        }
      } else if (taskNoteResponse.error) {
        alert(`Error fetching TaskNotes: ${taskNoteResponse.error.statusText}`);
        return false;
      }
  
      // Now delete the Note
      const result = await noteService.delete(id);
      if (!result.error) {
        setNotes((prevNotes) => prevNotes?.filter((note) => note.id !== id) ?? null);
        return true;
      } else {
        alert(`Error deleting note: ${result.error.statusText}`);
        return false;
      }
    }
    return false;
  };
  
  return (
    <Box paddingTop={2}>
      <TagSelect tags={tags} onSelectionChange={handleTagSelection} />
      <CreatedNotesList notes={notes} onDeleteNote={deleteNote} />
    </Box>
  );
};

export default NotesFilter;
