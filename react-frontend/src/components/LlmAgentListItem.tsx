import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LlmAgent } from '../models/LlmAgent';
import { ListItem, ListItemButton, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './LlmAgentListItem.css';

interface LlmAgentListItemProps {
  agent: LlmAgent;
  onDeleteAgent: (id: string | undefined) => void;
}

const LlmAgentListItem: React.FC<LlmAgentListItemProps> = ({ agent, onDeleteAgent }) => {
  const location = useLocation();

  const handleDelete = () => {
    onDeleteAgent(agent.id?.toString());
  };

  // Define the path to the agent's detail or update page
  const agentPath = `/update-llm-agent/${agent.id}`;

  // Check if the current location matches the agent's path
  const isCurrentAgent = location.pathname === agentPath;

  return (
    <ListItem
      disablePadding
      className={isCurrentAgent ? 'agents-item highlighted' : 'agents-item'}
      style={isCurrentAgent ? { backgroundColor: '#FF6666' } : {}}
    >
      <ListItemButton component={Link} to={agentPath}>
        <ListItemText primary={agent.name} />
        <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
};

export default LlmAgentListItem;