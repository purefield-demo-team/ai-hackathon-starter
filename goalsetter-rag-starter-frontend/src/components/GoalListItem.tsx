import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Goal } from '../models/Goal';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/system';
import { useMediaQuery, Divider } from '@mui/material';

interface GoalListItemProps {
  goal: Goal;
  onDeleteGoal: (id: number | undefined) => void;
}

const GoalListItem: React.FC<GoalListItemProps> = ({ goal, onDeleteGoal }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  const goalPath = `/update-goal/${goal.id}`;
  
  const isCurrentGoal = location.pathname === goalPath;

  const handleDelete = () => {
    onDeleteGoal(goal.id);
  };
  
  return (
    <React.Fragment>
      <ListItem disablePadding style={isCurrentGoal ? {backgroundColor: "#e7b39ae7"} : {}}>
        <ListItemButton component={Link} to={goalPath}>
          <ListItemText primary={goal.title} />
          <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </ListItemButton>
      </ListItem>
      {isMobile && <Divider />}
    </React.Fragment>
  );
};

export default GoalListItem;
