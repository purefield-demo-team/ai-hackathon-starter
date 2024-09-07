import React from 'react';
import { Goal } from '../../models/Goal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ListItemButton } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { alpha } from '@mui/system';

interface GoalsListProps {
  goals: Goal[];
  onGoalSelection?: (goal: Goal) => void;
  selectedGoals?: Goal[];
}

export const GoalsList: React.FC<GoalsListProps> = ({ goals, onGoalSelection, selectedGoals }) => {
    const handleGoalClick = (goal: Goal) => {
      if (onGoalSelection) {
        onGoalSelection(goal);
      }
    };
  
    return (
      <List>
        {goals.map((goal) => (
          <ListItem key={goal.id} disablePadding>
            <ListItemButton
              onClick={() => handleGoalClick(goal)}
              selected={selectedGoals?.some((selectedGoal) => selectedGoal.id === goal.id)}
            >
              <ListItemText primary={goal.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };
  

export default GoalsList;
