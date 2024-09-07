import React, { useState, useEffect } from 'react';
import { useFetchData } from '../hooks/useFetchData';
import goalService from '../services/goalService';
import { useUserProfile } from '../contexts/UserProfileContext';
import userProfileService from '../services/userProfileService';
import { Goal, GoalStatus } from '../models/Goal';
import { UserProfile } from '../models/UserProfile';
import { useKeycloak } from "@react-keycloak/web";
import CreatedGoalsList from './CreatedGoalsList';
import GoalForm from './GoalForm';
import { Tag } from '../models/Tag';
import { TagInput } from './TagInput';
import { Container, Typography, Grid, Button } from '@mui/material';
import GoalsFilter from './GoalsFilter';
import '../App.css';

const CreateGoal: React.FC = () => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<Tag[]>([]); // Add this line
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<GoalStatus>('not started');
  const { keycloak } = useKeycloak();
  const { userProfile, setUserProfile } = useUserProfile();
  const [goal, setGoal] = useState<Goal>({
    title,
    description,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status,
    userProfile: userProfile || undefined,
    tags,
  });
  
  //const [goals, setGoals] = useState<Goal[]>([]);

  const {
    data: goals,
    error: goalsError,
    isLoading: goalsLoading,
    refresh, // Destructure the refresh function from useFetchData
  } = useFetchData<Goal, [string | undefined]>(goalService.getAll, userProfile?.keycloaksubject);
  
  const handleTagsChange = (tags: Tag[]) => {
    setTags(tags);
  };

  useEffect(() => {
    setGoal({
      title,
      description,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      userProfile: userProfile || undefined,
      tags,
    });
  }, [title, description, startDate, endDate, status, userProfile, tags]);
  
  const handleFormChange = (field: keyof Goal, value: any) => {
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'endDate':
        setEndDate(value);
        break;
      case 'status':
        setStatus(value as GoalStatus);
        break;
    }
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!userProfile) {
      return;
    }  

    
  
    const response = await goalService.create(goal);
  
    if (response.data) {
      // Clear the form
      setTitle('');
      setDescription('');
      setStartDate(undefined);
      setEndDate(undefined);
      setStatus('not started');
  
      // Update the list of goals
      refresh();
    }
  
    // Display a success message or handle errors
  };

  if (goalsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container>
      <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
        <GoalsFilter keycloakSubject={userProfile?.keycloaksubject} />
      </Grid>
      <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
        <Typography variant="h4" gutterBottom>Create Goal</Typography>
        <TagInput goal={goal} onTagsChange={handleTagsChange} userProfile={userProfile} />
        <GoalForm
          goal={{ title, description, startDate, endDate, status }}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
        >
          <Grid container justifyContent="space-between" alignItems="center" mt={2}>
            <Grid item>
              <Button variant="contained" color="secondary" type="submit">Create Goal</Button>
            </Grid>
          </Grid>
        </GoalForm>
        
      
      </Grid>
    </Grid>
  );
};

export default CreateGoal;
