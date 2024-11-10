import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import llmAgentService from '../services/llmAgentService';
import { useUserProfile } from '../contexts/UserProfileContext';
import { LlmAgent } from '../models/LlmAgent';
import { UserProfile } from '../models/UserProfile';
import LlmAgentForm from './LlmAgentForm';
import { Grid, Typography, Button } from '@mui/material';
import '../App.css';

const CreateLlmAgent: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const [agent, setAgent] = useState<LlmAgent>({
    systemContent: '',
    systemContentMoreInfo: '',
    systemContentType: '',
    description: '',
    name: '',
    systemContentRole: '',
    userContentRole: '',
    state: '',
  });

  const handleFormChange = (field: keyof LlmAgent, value: any) => {
    setAgent((prevAgent) => ({
      ...prevAgent,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userProfile) {
      return;
    }

    const newAgent: LlmAgent = {
      ...agent,
    };

    const response = await llmAgentService.create(newAgent);

    if (response.data) {
      // Clear the form
      setAgent({
        systemContent: '',
        systemContentMoreInfo: '',
        systemContentType: '',
        description: '',
        name: '',
        systemContentRole: '',
        userContentRole: '',
        state: '',
      });

      // Navigate to the agent details page or update the list
      navigate(`/update-llm-agent/${response.data.id}`);
    } else {
      // Handle errors
      console.error('Error creating LlmAgent:', response.error);
    }
  };

  return (
    <Grid container>
      <Grid item xs={12} className="main-content">
        <Typography variant="h4" gutterBottom>
          Create LlmAgent
        </Typography>
        <LlmAgentForm agent={agent} onSubmit={handleSubmit} onChange={handleFormChange}>
          <Grid container justifyContent="flex-start" mt={2}>
            <Grid item>
              <Button variant="contained" color="secondary" type="submit">
                Create LlmAgent
              </Button>
            </Grid>
          </Grid>
        </LlmAgentForm>
      </Grid>
    </Grid>
  );
};

export default CreateLlmAgent;