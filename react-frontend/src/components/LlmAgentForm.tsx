import React from 'react';
import { LlmAgent } from '../models/LlmAgent';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

type LlmAgentFormProps = {
  agent: Partial<LlmAgent>;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (field: keyof LlmAgent, value: any) => void;
  children: React.ReactNode;
};

const LlmAgentForm: React.FC<LlmAgentFormProps> = ({
  agent,
  onSubmit,
  onChange,
  children,
}) => {
  const {
    name,
    description,
    systemContent,
    systemContentMoreInfo,
    systemContentType,
    systemContentRole,
    userContentRole,
    state,
  } = agent;

  return (
    <form onSubmit={onSubmit}>
      <Box component="div" className="form-container">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={name || ''}
              onChange={(event) => onChange('name', event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={description || ''}
              onChange={(event) => onChange('description', event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="System Content"
              multiline
              rows={4}
              value={systemContent || ''}
              onChange={(event) => onChange('systemContent', event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="System Content More Info"
              multiline
              rows={4}
              value={systemContentMoreInfo || ''}
              onChange={(event) => onChange('systemContentMoreInfo', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>System Content Type</InputLabel>
              <Select
                value={systemContentType || ''}
                onChange={(event) => onChange('systemContentType', event.target.value)}
              >
                {/* Replace with your actual options */}
                <MenuItem value="type1">Type1</MenuItem>
                <MenuItem value="type2">Type2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="System Content Role"
              value={systemContentRole || ''}
              onChange={(event) => onChange('systemContentRole', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="User Content Role"
              value={userContentRole || ''}
              onChange={(event) => onChange('userContentRole', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              value={state || ''}
              onChange={(event) => onChange('state', event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default LlmAgentForm;