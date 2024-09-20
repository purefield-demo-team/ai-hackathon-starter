import React, { useState, useEffect } from 'react';
import { Tag } from '../../models/Tag';
import tagService from '../../services/tagService';
import goalService from '../../services/goalService';
import noteService from '../../services/noteService';
import { StrapiServiceResponse } from '../../types/StrapiServiceResponse';
import { Goal } from '../../models/Goal';
import { Note } from '../../models/Note';
import { GoalsList } from './GoalsList';
import { NotesList } from './NotesList';
import TagSelect from '../TagSelect';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

interface ItemsFilterProps {
    keycloakSubject: string | undefined;
    onGoalSelectionChange?: (selectedGoals: Goal[]) => void;
    onNoteSelectionChange?: (selectedNotes: Note[]) => void;
  }
  
  

const ItemsFilter: React.FC<ItemsFilterProps> = ({ keycloakSubject, onGoalSelectionChange, onNoteSelectionChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[] | null>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[] | null>([]);

  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);

  const handleGoalSelection = (goal: Goal) => {
    const newSelectedGoals = selectedGoals.some((g) => g.id === goal.id)
      ? selectedGoals.filter((g) => g.id !== goal.id)
      : [...selectedGoals, goal];
    setSelectedGoals(newSelectedGoals);
    if (typeof onGoalSelectionChange === 'function') {
      onGoalSelectionChange(newSelectedGoals);
    }
  };
  
  const handleNoteSelection = (note: Note) => {
    const newSelectedNotes = selectedNotes.some((n) => n.id === note.id)
      ? selectedNotes.filter((n) => n.id !== note.id)
      : [...selectedNotes, note];
    setSelectedNotes(newSelectedNotes);
    if (typeof onNoteSelectionChange === 'function') {
      onNoteSelectionChange(newSelectedNotes);
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
  }, [keycloakSubject]);

  const handleTagSelection = async (selectedTags: Tag[]) => {
    if (selectedTags.length === 0) {
      setFilteredGoals([]);
      setFilteredNotes([]);
    } else {
      const goalsResponse: StrapiServiceResponse<Goal[]> = await goalService.getByTags(selectedTags);
      if (goalsResponse.data) {
        setFilteredGoals(goalsResponse.data);
      }

      const notesResponse: StrapiServiceResponse<Note[]> = await noteService.getByTags(selectedTags);
      if (notesResponse.data) {
        setFilteredNotes(notesResponse.data);
      }
    }
  };

  return (
    <Box paddingTop={2}>
      <TagSelect tags={tags} onSelectionChange={handleTagSelection} />
      {filteredGoals && filteredGoals.length > 0 && (
        <Typography variant="h5" gutterBottom>Select Goals</Typography>
      )}
      <GoalsList goals={filteredGoals || []} onGoalSelection={handleGoalSelection} selectedGoals={selectedGoals} />
      {filteredNotes && filteredNotes.length > 0 && (
        <Typography variant="h5" gutterBottom>Select Notes</Typography>
      )}
      <NotesList notes={filteredNotes || []} onNoteSelection={handleNoteSelection} selectedNotes={selectedNotes} />
    </Box>
  );
};

export default ItemsFilter;
