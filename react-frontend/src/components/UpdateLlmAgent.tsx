import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import llmAgentService from '../services/llmAgentService';
import { LlmAgent } from '../models/LlmAgent';
import LlmAgentForm from './LlmAgentForm';
import { Grid, Typography, Button, CircularProgress } from '@mui/material';
import '../App.css';
import LlmAgentsFilter from './LlmAgentsFilter';
import { useUserProfile } from '../contexts/UserProfileContext';

interface LocationState {
  previousRoute?: string;
}

const UpdateLlmAgent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useUserProfile();
  const [agent, setAgent] = useState<LlmAgent | null>(null);
  const [refreshFilter, setRefreshFilter] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      if (id) {
        const response = await llmAgentService.get(id);
        if (response.data) {
          setAgent(response.data);
        } else {
          console.error('LlmAgent not found');
        }
      }
    };
    fetchAgent();
  }, [id]);

  useEffect(() => {
    setRefreshFilter(false);
  }, [refreshFilter]);

  const handleFormChange = (field: keyof LlmAgent, value: any) => {
    if (!agent) return;
    setAgent((prevAgent) => ({
      ...(prevAgent as LlmAgent),
      [field]: value,
    }));
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!agent || !id) return;

    const response = await llmAgentService.update(id, agent);
    if (response.data) {
      // Update successful
      setRefreshFilter(true);
    } else {
      console.error('Error updating LlmAgent:', response.error);
    }
  };

  const handleGoBack = () => {
    const previousRoute = (location.state as LocationState)?.previousRoute;
    if (previousRoute) {
      navigate(previousRoute);
    } else {
      navigate(-1);
    }
  };

  if (!agent) {
    return <CircularProgress />;
  }

  return (
    <Grid container>
      <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
        <LlmAgentsFilter keycloakSubject={userProfile?.keycloaksubject} refresh={refreshFilter} />
      </Grid>
      <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
        <Typography variant="h4" gutterBottom>
          Update LlmAgent
        </Typography>
        <LlmAgentForm agent={agent} onSubmit={handleUpdate} onChange={handleFormChange}>
          <Grid container justifyContent="space-between" alignItems="center" mt={2}>
            <Grid item>
              <Button variant="contained" color="secondary" type="submit">
                Update LlmAgent
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={handleGoBack}>
                Previous
              </Button>
            </Grid>
          </Grid>
        </LlmAgentForm>
      </Grid>
    </Grid>
  );
};

export default UpdateLlmAgent;