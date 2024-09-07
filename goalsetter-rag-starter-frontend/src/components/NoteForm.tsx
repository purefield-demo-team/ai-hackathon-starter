// src/components/NoteForm.tsx

import React from 'react';
import { Note } from '../models/Note';
import { TextField, Box, Grid } from '@mui/material';
import MUIQuillEditor from './MUIQuillEditor';

type NoteFormProps = {
  note: Partial<Note>;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (field: keyof Note, value: any) => void;
  children: React.ReactNode;
};

const NoteForm: React.FC<NoteFormProps> = ({ note, onSubmit, onChange, children }) => {
  const { name, richText, recordedAt } = note;

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
              label="Name"
              value={name}
              onChange={(event) => onChange('name', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} >
            <MUIQuillEditor
              value={richText}
              onChange={(value) => onChange('richText', value)}
              style={{ marginBottom: '40px', height:'300px' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box paddingTop={1}>
              <TextField
                fullWidth
                label="Recorded At"
                type="datetime-local"
                value={note.recordedAt ? formatDateForInput(note.recordedAt) : ""}
                onChange={(event) => onChange("recordedAt", event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </Box>
    </form>
  );
};

export default NoteForm;
