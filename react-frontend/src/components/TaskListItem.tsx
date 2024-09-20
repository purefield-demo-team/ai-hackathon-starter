import { Link, useLocation } from 'react-router-dom';
import { Task, TaskStatus } from '../models/Task';
import ListItem from '@mui/material/ListItem';
import './TaskListItem.css';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';
import { Tooltip } from '@mui/material';

interface TaskListItemProps {
  task: Task;
  onDeleteTask: (id: string | undefined) => void;
}

interface TaskStyleProps {
  isCompleted: boolean;
  isPastDue: boolean;
}

const TaskStatusBadge = styled('span')<TaskStyleProps>(({ theme, isCompleted, isPastDue }) => ({
    display: 'inline-block',
    minWidth: '30px',  // increase width
    height: '30px',  // increase height
    borderRadius: '50%',
    lineHeight: '30px',  // align this with the new height
    textAlign: 'center',
    backgroundColor: isPastDue ? 'red' : isCompleted ? 'green' : theme.palette.grey[500],
    color: 'white',
    marginRight: '10px' // add some margin to separate it from the ListItemText
  }));
  


const TaskListItem: React.FC<TaskListItemProps> = ({ task, onDeleteTask }) => {
  const location = useLocation();
  const isCompleted = task.status === 'completed';
  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date();

  const handleDelete = () => {
    onDeleteTask(task.id?.toString());
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

  // Define a string to represent the path of the task
  const taskPath = `/update-task/${task.id}`;

  // Check if the current location's pathname matches the task's path
  const isCurrentTask = location.pathname === taskPath;

  return (
    <ListItem
        disablePadding
        className={isCurrentTask ? "tasks-item highlighted" : "tasks-item"}
        style={isCurrentTask ? {backgroundColor: "#e7b39ae7"} : {}}
    >
      <ListItemButton component={Link} to={taskPath}>
        <Tooltip title={task.status} placement="top">
            <TaskStatusBadge
            isCompleted={isCompleted}
            isPastDue={!!isPastDue && !isCompleted}
            >
            {getStatusInitials(task.status)}
            </TaskStatusBadge>
        </Tooltip>
        <ListItemText primary={task.title} />
        <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
};

export default TaskListItem;
