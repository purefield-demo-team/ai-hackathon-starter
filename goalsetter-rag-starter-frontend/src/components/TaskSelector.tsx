import React, { useState, useEffect } from 'react';
import { Task } from '../models/Task';
import { FormControl, TextField, Chip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface TaskSelectorProps {
    tasks: Task[];
    preSelectedTasks: Task[];
    onSelectionChange: (selectedTasks: Task[]) => void;
  };
  
  const TaskSelector: React.FC<TaskSelectorProps> = ({ tasks, preSelectedTasks, onSelectionChange }) => {
    const [selectedTasks, setSelectedTasks] = useState<Task[]>(preSelectedTasks ?? []);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
    useEffect(() => {
      onSelectionChange(selectedTasks);
    }, [selectedTasks, onSelectionChange]);
  
    useEffect(() => {
      setSelectedTasks(preSelectedTasks);
    }, [preSelectedTasks]);
  
    const handleTaskClick = (task: Task) => {
      setSelectedTask(task);
      setOpenDialog(true);
    };
  
    return (
      <FormControl variant="outlined" style={{ width: '100%' }}>
        <Autocomplete
          multiple
          options={tasks}
          getOptionLabel={(option) => option.title} // Assuming tasks have a 'title' property
          value={selectedTasks}
          onChange={(event, newValue) => {
            
            setSelectedTasks(newValue);
            //onSelectionChange(newValue);
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" label="Tasks" />}
          renderTags={(value: Task[], getTagProps) =>
              value.map((option: Task, index: number) => (
                <Chip
                  variant="outlined"
                  label={option.title}
                  {...getTagProps({ index })}
                  clickable  // make the Chip clickable
                  onClick={() => handleTaskClick(option)}  // handle click event
                />
              ))
            }
        />
        {selectedTasks.length > 0 && <p>Last added task: {selectedTasks[selectedTasks.length - 1].title}</p>} {/* Display last selected task */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{selectedTask?.title}</DialogTitle>
          <DialogContent>
              <DialogContentText>
                  {selectedTask?.description} {/* Assuming tasks have a 'description' property */}
              </DialogContentText>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
         </Dialog>
  
      </FormControl>
      
    );
  };
  
  export default TaskSelector;
  