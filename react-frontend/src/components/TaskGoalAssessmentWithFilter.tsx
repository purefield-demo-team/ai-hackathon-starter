import React, { useState } from 'react';
import TaskGoalAssessment from './TaskGoalAssessment';
import ItemsFilter from './dashboard/ItemsFilter';
import { Goal } from '../models/Goal';
import { Note } from '../models/Note';
import { Container, Box, CircularProgress, Typography, Divider, Grid } from '@mui/material';
import { useUserProfile } from '../contexts/UserProfileContext';
import AssessmentList from './AssessmentList';

interface TaskGoalAssessmentWithFilterProps {
    goalId?: number;
    onGoalSelectionChange?: (selectedGoals: Goal[]) => void;
    onNoteSelectionChange?: (selectedNotes: Note[]) => void;
  }

const TaskGoalAssessmentWithFilter: React.FC<TaskGoalAssessmentWithFilterProps> = ({ goalId }) => {
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const { userProfile, setUserProfile } = useUserProfile();

  const handleGoalSelection = (selectedGoals: Goal[]) => {
    setSelectedGoals(selectedGoals);
  };

  const handleNoteSelection = (selectedNotes: Note[]) => {
    setSelectedNotes(selectedNotes);
  };

  return (
    <Grid container>
      <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
        
        {userProfile ? <AssessmentList goalId={goalId} /> : <CircularProgress />}
      </Grid>
      <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
        <Box sx={{ paddingTop: '20px' }}>
            
        </Box>
        <Box mx={2}>
            <Typography variant="h4" component="h2">
              Past Assessments
            </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default TaskGoalAssessmentWithFilter;
