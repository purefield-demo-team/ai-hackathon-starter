import React from 'react';
import { Goal, GoalStatus } from '../models/Goal';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Grid } from '@mui/material';
import MUIQuillEditor from './MUIQuillEditor';

type GoalFormProps = {
  goal: Partial<Goal>;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (field: keyof Goal, value: any) => void;
  children: React.ReactNode;
};

const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onChange, children }) => {
  const { title, description, startDate, endDate, status } = goal;

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <form onSubmit={onSubmit}>
      <Box component="div" className="form-container">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(event) => onChange('title', event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <MUIQuillEditor
              value={description} // Use the `description` field
              onChange={(value) => onChange('description', value)} // Update the `description` field
              style={{ marginBottom: '40px', height:'300px' }} // Add a margin to the MUIQuillEditor component
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="datetime-local"
              value={goal.startDate ? formatDateForInput(goal.startDate) : ""}
              onChange={(event) => onChange("startDate", event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="datetime-local"
              value={goal.endDate ? formatDateForInput(goal.endDate) : ""}
              onChange={(event) => onChange("endDate", event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(event) => onChange('status', event.target.value as GoalStatus)}
              >
                <MenuItem value="not started">Not Started</MenuItem>
                <MenuItem value="in progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default GoalForm;
