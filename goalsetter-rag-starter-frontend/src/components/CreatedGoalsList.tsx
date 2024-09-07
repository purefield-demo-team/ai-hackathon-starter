import React from 'react';
import { Link } from 'react-router-dom';
import { Goal } from '../models/Goal';
import './CreatedGoalsList.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { Divider } from '@mui/material';
import { useTheme } from '@mui/system';
import GoalListItem from './GoalListItem';
import { useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add  } from '@mui/icons-material';

interface CreatedGoalsListProps {
  goals: Goal[] | null;
  onDeleteGoal: (id: number | undefined) => void;
}

const CreatedGoalsList: React.FC<CreatedGoalsListProps> = ({ goals, onDeleteGoal }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const navigate = useNavigate();

  if (!goals || !Array.isArray(goals)) {
    return <div>Loading goals...</div>;
  }

  const handleDelete = (id: number | undefined) => {
    onDeleteGoal(id);
  };

  const handleCreateGoal = () => {
    navigate('/create-goal');
  }

  return (
    <div className="goals-list">
      <h2>Goals <IconButton onClick={handleCreateGoal} color="primary" aria-label="add goal" component="span">
                                        <Add  style={{ fontSize: '3rem' }} />
                                    </IconButton></h2>
      <List>
        {goals.map((goal) => (
          <React.Fragment key={goal.id}>
            <GoalListItem 
              key={goal.id} 
              goal={goal} 
              onDeleteGoal={onDeleteGoal} 
            />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
};

export default CreatedGoalsList;
