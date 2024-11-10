// src/components/CreateAgentRouter.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import llmAgentService from '../services/llmAgentService';
import agentRouterService from '../services/agentRouterService';
import { LlmAgent } from '../models/LlmAgent';
import { AgentRouter } from '../models/AgentRouter';
import { LlmAgentNode } from '../models/LlmAgentNode';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useUserProfile } from '../contexts/UserProfileContext';

const CreateAgentRouter: React.FC = () => {
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [outputAgent, setOutputAgent] = useState<LlmAgent | null>(null);
  const [inputAgents, setInputAgents] = useState<LlmAgent[]>([]);
  const [allAgents, setAllAgents] = useState<LlmAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      const response = await llmAgentService.getAll();
      if (response.data) {
        setAllAgents(response.data);
      } else {
        console.error('Error fetching agents:', response.error);
      }
      setLoadingAgents(false);
    };
    fetchAgents();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!outputAgent) {
      alert('Please select an output agent.');
      return;
    }

    const startNode: LlmAgentNode = {
      outputAgent,
      inputAgents,
    };

    const agentRouter: AgentRouter = {
      name,
      description,
      startNode,
    };

    const response = await agentRouterService.create(agentRouter);
    if (response.data) {
      // Navigate to the update page or wherever appropriate
      navigate(`/update-agent-router/${response.data.id}`);
    } else {
      console.error('Error creating AgentRouter:', response.error);
    }
  };

  if (loadingAgents) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">Create Agent Router</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          options={allAgents}
          getOptionLabel={(option) => option.name}
          value={outputAgent}
          onChange={(event, newValue) => setOutputAgent(newValue)}
          renderInput={(params) => <TextField {...params} label="Output Agent" />}
        />
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={allAgents}
          getOptionLabel={(option) => option.name}
          value={inputAgents}
          onChange={(event, newValue) => setInputAgents(newValue)}
          renderInput={(params) => <TextField {...params} label="Input Agents" />}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Create Agent Router
        </Button>
      </Grid>
    </Grid>
  );
};

export default CreateAgentRouter;