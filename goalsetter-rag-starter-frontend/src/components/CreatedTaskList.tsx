import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Task, TaskStatus } from '../models/Task';
import './CreatedTasksList.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Box, Typography, Grid, Select, MenuItem, Divider, useMediaQuery, useTheme, Tooltip } from '@mui/material';
import taskService from '../services/taskService';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import TaskListItem from './TaskListItem';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { Add  } from '@mui/icons-material';

interface TaskStyleProps {
  isCompleted: boolean;
  isPastDue: boolean;
}

const TaskStatusBadge = styled('span')<TaskStyleProps>(({ theme, isCompleted, isPastDue }) => ({
  display: 'inline-block',
  width: '25px',
  height: '25px',
  borderRadius: '50%',
  lineHeight: '25px',
  textAlign: 'center',
  backgroundColor: isPastDue ? 'red' : isCompleted ? 'green' : theme.palette.grey[500],
  color: 'white',
}));

const StyledListItemText = styled(ListItemText)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  paddingRight: '75px',  // add padding
});



interface CreatedTasksListProps {
  tasks: Task[] | null | undefined;
  onDeleteTask: (id: string | undefined) => void;
  onTaskStatusChange: (taskId: string | undefined, newStatus: TaskStatus) => void;
  previousRoute: string;
  addTaskButton?: React.ReactNode;
}


export const CreatedTasksList: React.FC<CreatedTasksListProps> = ({ tasks, onDeleteTask, onTaskStatusChange, previousRoute, addTaskButton }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  if (!tasks || !Array.isArray(tasks)) {
    return <div>Loading tasks...</div>;
  }

  const handleStatusChange = (taskId: string | undefined, newStatus: TaskStatus) => {
    onTaskStatusChange(taskId, newStatus);
    setIsEditing(null);  // reset editing state after status has been changed
  }

  const handleDelete = (id: string | undefined) => {
    onDeleteTask(id);
  };

  const getStatusInitials = (status: TaskStatus) => {
    switch(status) {
      case "not started":
        return "NS";
      case "in progress":
        return "IP";
      case "completed":
        return "C";
      default:
        return "";
    }
  };

  const handleCreateTask = () => {
    navigate('/create-task');
  }

  return (
    <div className="tasks-list">
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={10} sm={11}>
          <Box display="flex" justifyContent="center">
            <Typography variant="h6" gutterBottom>
              Tasks <IconButton onClick={handleCreateTask} color="primary" aria-label="add task" component="span">
                                        <Add  style={{ fontSize: '3rem' }} />
                                    </IconButton>
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2} sm={1}>
          <Box display="flex" justifyContent="left">
            {addTaskButton && <Box>{addTaskButton}</Box>}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <List>
          {tasks.map((task) => (
            <TaskListItem key={task.id} task={task} onDeleteTask={onDeleteTask} />
          ))}
          </List>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreatedTasksList;

