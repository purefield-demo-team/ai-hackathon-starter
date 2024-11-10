import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LlmAgent } from '../models/LlmAgent';
import './CreatedLlmAgentsList.css';
import { List, Grid, Box, Typography, IconButton } from '@mui/material';
import { Add } from '@mui/icons-material';
import LlmAgentListItem from './LlmAgentListItem';

interface CreatedLlmAgentsListProps {
  agents: LlmAgent[] | null | undefined;
  onDeleteAgent: (id: string | undefined) => void;
  addAgentButton?: React.ReactNode;
}

const CreatedLlmAgentsList: React.FC<CreatedLlmAgentsListProps> = ({
  agents,
  onDeleteAgent,
  addAgentButton,
}) => {
  const navigate = useNavigate();

  if (!agents || !Array.isArray(agents)) {
    return <div>Loading agents...</div>;
  }

  const handleCreateAgent = () => {
    navigate('/create-llm-agent');
  };

  return (
    <div className="agents-list">
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={10} sm={11}>
          <Box display="flex" justifyContent="center">
            <Typography variant="h6" gutterBottom>
              LLM Agents{' '}
              <IconButton
                onClick={handleCreateAgent}
                color="primary"
                aria-label="add agent"
                component="span"
              >
                <Add style={{ fontSize: '2rem' }} />
              </IconButton>
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2} sm={1}>
          <Box display="flex" justifyContent="left">
            {addAgentButton && <Box>{addAgentButton}</Box>}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <List>
            {agents.map((agent) => (
              <LlmAgentListItem key={agent.id} agent={agent} onDeleteAgent={onDeleteAgent} />
            ))}
          </List>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreatedLlmAgentsList;