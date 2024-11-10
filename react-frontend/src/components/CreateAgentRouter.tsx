// src/components/CreateAgentRouter.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LlmAgent } from '../models/LlmAgent';
import { AgentRouter } from '../models/AgentRouter';
import { LlmAgentNode } from '../models/LlmAgentNode';
import llmAgentService from '../services/llmAgentService';
import agentRouterService from '../services/agentRouterService';
import { TextField, Button, Grid, Typography, CircularProgress } from '@mui/material';
import AgentNodeEditor from './AgentNodeEditor';

const CreateAgentRouter: React.FC = () => {
  const navigate = useNavigate();
  const [allAgents, setAllAgents] = useState<LlmAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Initialize startNode with a default node
  const [startNode, setStartNode] = useState<LlmAgentNode>({
    outputAgent: {} as LlmAgent, // Empty agent to start with
    inputAgents: [],
  });

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

    if (!startNode.outputAgent || !startNode.outputAgent.id) {
      alert('Please select a starting agent.');
      return;
    }

    const agentRouter: AgentRouter = {
      name,
      description,
      startNode,
    };

    const response = await agentRouterService.create(agentRouter);
    if (response.data) {
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
        <Typography variant="h6">Configure Routing Nodes</Typography>
        <AgentNodeEditor
          node={startNode}
          setNode={setStartNode}
          allAgents={allAgents}
          nodeLabel="Start Node"
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