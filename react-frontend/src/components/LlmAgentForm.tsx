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
              placeholder="You answer questions about Tasks, Goals, and Notes. Use the below information to answer the subsequent question. If the answer cannot be found in the notes, write 'I could not find an answer.'"
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
              placeholder="More Info: The Question above should be answered by giving me extra information about each of the items discussed. Don't just paste the question content back, do some research with the articles I gave you as well as your knowledge and give me a comprehensive response."
              onChange={(event) => onChange('systemContentMoreInfo', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
                fullWidth
                label="System Content Type"
                value={systemContentType || ''}
                placeholder="Notes"
                onChange={(event) => onChange('systemContentType', event.target.value)}
              />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="System Content Role"
              value={systemContentRole || ''}
              placeholder="System"
              onChange={(event) => onChange('systemContentRole', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="User Content Role"
              value={userContentRole || ''}
              placeholder="User"
              onChange={(event) => onChange('userContentRole', event.target.value)}
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