import React, { useState, useEffect } from 'react';
import { Goal } from '../models/Goal';
import { GoalTask } from '../models/GoalTask';
import { Task, TaskStatus } from '../models/Task';
import MUIQuillEditor from './MUIQuillEditor';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, TextField, FormControl, Typography, InputLabel, Select, MenuItem, Box, Grid, CircularProgress, SelectChangeEvent, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

type TaskFormProps = {
  task: Partial<Task>;
  goals: Goal[] | null;
  goalTasks: GoalTask[] | null;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (field: keyof Task, value: any) => void;
  onGoalsChange?: (selectedGoals: Goal[]) => void;
  children: React.ReactNode;
  isChatAccordionOpen: boolean;
  setIsChatAccordionOpen: (isOpen: boolean) => void;
  showGoalsDropdown?: boolean;
};


const TaskForm: React.FC<TaskFormProps> = ({
  task,
  goals,
  goalTasks,
  onSubmit,
  onChange,
  onGoalsChange,
  children,
  isChatAccordionOpen,
  setIsChatAccordionOpen,
  showGoalsDropdown,
}) => {
  // Add state for selected goals
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>(() => {
    if (goals && goalTasks) {
      return goals.filter((goal) =>
        goalTasks.some((goalTask) => goalTask.goal.id === goal.id)
      );
    }
    return [];
  });
  
  const [allSelected, setAllSelected] = useState<boolean>(!selectedGoals.length);
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const handleChatAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setIsChatAccordionOpen(isExpanded);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setExpanded(false);
    setIsChatAccordionOpen(false); // Close the accordion on submit
    onSubmit(event);    // Call the onSubmit prop passed from UpdateTask.tsx
  };

  // useEffect(() => {
  //   if (goals && goalTasks) {
  //     const initialSelectedGoals = goals.filter((goal) =>
  //       goalTasks.some((goalTask) => goalTask.goal.id === goal.id)
  //     );
  //     setSelectedGoals(initialSelectedGoals);
  //   }
  // }, [goals, goalTasks]);

  // Handle change for the multi-select dropdown
  const handleGoalsChange = (event: SelectChangeEvent<number[]>) => {
    const goalIds = event.target.value as number[];
    if (goalIds.includes(-1) && goalIds.length < 2) {
      setAllSelected(true);
      setSelectedGoals([]);
      if(onGoalsChange)
      {
        onGoalsChange([]); // Send an empty array when "All" is selected
      }
      
    } else {
      setAllSelected(false);
      let tempSelectedGoals = [] as Goal[];
      if (goals !== null) {
        tempSelectedGoals = goalIds
          .map((id) => goals.find((goal) => goal.id === id))
          .filter(Boolean) as Goal[];
      }
      setSelectedGoals(tempSelectedGoals);
      if(onGoalsChange)
      {
        onGoalsChange(tempSelectedGoals); // Send tempSelectedGoals instead of selectedGoals
      }
      
    }
  };
  

  const { title, description, startDate, dueDate, closeDate, status } = task;

  const formatDateForInput = (dateString: string) => {
    if (!dateString) {
      return "";
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const truncate = (input: string, maxLength: number = 20) => {
    if (input.length > maxLength) {
      return input.substring(0, maxLength) + '...';
    }
    return input;
  };

  
  return (
    <form onSubmit={handleSubmit}>

      <Box component="div" className="form-container">
       
      <Grid container spacing={2}>
          {goals && goals.length > 0  && showGoalsDropdown ? (
            <Grid item xs={12}>
              <InputLabel>Goals</InputLabel>
              <Select
                multiple
                style={{minHeight: '80px'}}
                value={allSelected ? [-1] : selectedGoals.map((goal) => goal.id).filter((id): id is number => id !== undefined)}
                onChange={handleGoalsChange}
                renderValue={(selected) => {
                  if (selected.length === 0 || (selected.length === 1 && selected[0] === -1)) {
                    return 'All';
                  }
                  return (selected as number[])
                    .filter((id) => id !== -1)
                    .map((id) => goals.find((goal) => goal.id === id)?.title)
                    .map((title) => truncate(title || ""))
                    .join(', ');
                }}
                >
                <MenuItem value={-1}>All</MenuItem>
                {goals.map((goal) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {truncate(goal.title)}
                  </MenuItem>
                ))}
                </Select>
          </Grid>
          ) : (
          ""
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(event) => onChange('title', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Accordion expanded={isChatAccordionOpen} onChange={handleChatAccordionChange}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="chat-fields-content"
                id="chat-fields-header"
              >
                <Typography>Chat</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <MUIQuillEditor
                  value={description} // Use the `description` field
                  onChange={(value) => onChange('description', value)} // Update the `description` field
                  style={{ marginBottom: '40px', height: '300px' }}// Add a margin to the MUIQuillEditor component
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            <Accordion expanded={expanded} onChange={handleAccordionChange}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="additional-fields-content"
                id="additional-fields-header"
              >
                <Typography>Additional Fields</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Date Fields */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="datetime-local"
                      value={dueDate ? formatDateForInput(dueDate) : ""}
                      onChange={(event) => onChange("dueDate", event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="datetime-local"
                      value={startDate ? formatDateForInput(startDate) : ""}
                      onChange={(event) => onChange("startDate", event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Close Date"
                      type="datetime-local"
                      value={closeDate ? formatDateForInput(closeDate) : ""}
                      onChange={(event) => onChange("closeDate", event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  {/* Status Field */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={status}
                        onChange={(event) => onChange('status', event.target.value as TaskStatus)}
                      >
                        <MenuItem value="not started">Not Started</MenuItem>
                        <MenuItem value="in progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default TaskForm;

