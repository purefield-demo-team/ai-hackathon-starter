import React, { useState, useEffect } from 'react';
import { Tag } from '../models/Tag';
import tagService from '../services/tagService';
import goalService from '../services/goalService';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { Goal } from '../models/Goal';
import CreatedGoalsList from './CreatedGoalsList';
import TagSelect from './TagSelect';
import Box from '@mui/material/Box';

interface GoalsFilterProps {
  keycloakSubject: string | undefined;
}

const GoalsFilter: React.FC<GoalsFilterProps> = ({ keycloakSubject }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [goals, setGoals] = useState<Goal[] | null>(null);

  const fetchGoals = async () => {
    const response: StrapiServiceResponse<Goal[]> = await goalService.getAll(keycloakSubject);
    if (response.data) {
      setGoals(response.data);
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
    fetchGoals();
  }, [keycloakSubject]);

  const handleTagSelection = async (selectedTags: Tag[]) => {
    if (selectedTags.length === 0) {
      fetchGoals();
    } else {
      const response: StrapiServiceResponse<Goal[]> = await goalService.getByTags(selectedTags);
      if (response.data) {
        setGoals(response.data);
      }
    }
  };

  const deleteGoal = async (id: number | undefined) => {
    if (id) {
      const result = await goalService.delete(id);
      if (!result.error) {
        setGoals(goals?.filter((goal) => goal.id !== id) ?? null);
      } else {
        alert(`Error deleting goal: ${result.error.statusText}`);
      }
    }
  };

  return (
    <Box paddingTop={2}>
      <TagSelect tags={tags} onSelectionChange={handleTagSelection} />
      <CreatedGoalsList goals={goals} onDeleteGoal={deleteGoal} />
    </Box>
  );
};

export default GoalsFilter;
