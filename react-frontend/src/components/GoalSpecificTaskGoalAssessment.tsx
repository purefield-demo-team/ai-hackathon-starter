// src/components/GoalSpecificTaskGoalAssessment.tsx

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TaskGoalAssessment from './TaskGoalAssessment';
import { Container, Box, CircularProgress, Typography, Divider, Button } from '@mui/material';
import { useUserProfile } from '../contexts/UserProfileContext';
import AssessmentList from './AssessmentList';

interface RouteParams extends Record<string, string | undefined> {
  id: string | undefined;
}

const GoalSpecificTaskGoalAssessment: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const { userProfile, setUserProfile } = useUserProfile();
  const navigate = useNavigate();

  // Convert the string id to a number
  const goalId = id ? parseInt(id) : undefined;

  // You can pass the goalId down to the TaskGoalAssessment component and use it as needed.
  return (
    <Container maxWidth="md">
      {userProfile ? <AssessmentList goalId={goalId} /> : <CircularProgress />}
      {/* <Box my={4} sx={{ display: 'flex', alignItems: 'center' }}>
        <Box flexGrow={1}>
          <Divider
            sx={{
              height: '3px',
              borderRadius: '3px',
              backgroundImage: 'linear-gradient(90deg, #3f51b5, #f50057)',
            }}
          />
        </Box>
        <Box mx={2}>
          <Typography variant="h4" component="h2">
            Task and Goal Assessment
          </Typography>
        </Box>
        <Box flexGrow={1}>
          <Divider
            sx={{
              height: '3px',
              borderRadius: '3px',
              backgroundImage: 'linear-gradient(90deg, #f50057, #3f51b5)',
            }}
          />
        </Box>
      </Box>
      <Box mb={4}>
        <TaskGoalAssessment goalId={goalId} />
      </Box> */}
      
    </Container>
  );
};

export default GoalSpecificTaskGoalAssessment;
