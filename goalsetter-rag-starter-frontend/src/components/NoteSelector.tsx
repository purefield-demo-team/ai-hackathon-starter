import React, { useState, useEffect } from 'react';
import { Note } from '../models/Note';
import { FormControl, TextField, Chip, IconButton  } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';


interface NoteSelectorProps {
  notes: Note[];
  preSelectedNotes: Note[];
  onSelectionChange: (selectedNotes: Note[]) => void;
};

const NoteSelector: React.FC<NoteSelectorProps> = ({ notes, preSelectedNotes, onSelectionChange }) => {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>(preSelectedNotes ?? []);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    onSelectionChange(selectedNotes);
  }, [selectedNotes, onSelectionChange]);

  useEffect(() => {
    setSelectedNotes(preSelectedNotes);
  }, [preSelectedNotes]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setOpenDialog(true);
  };

  const handleEditNoteClick = (noteId: number) => {
    navigate(`/update-note/${noteId}`);
  };
  

  return (
    <FormControl variant="outlined" style={{ width: '100%' }}>
      <Autocomplete
        multiple
        options={notes}
        getOptionLabel={(option) => option.name}
        value={selectedNotes}
        onChange={(event, newValue) => {
          setSelectedNotes(newValue);
        }}
        renderInput={(params) => <TextField {...params} variant="outlined" label="Notes" />}
        renderTags={(value: Note[], getTagProps) =>
            value.map((option: Note, index: number) => (
              <Chip
                variant="outlined"
                label={option.name}
                {...getTagProps({ index })}
                clickable  // make the Chip clickable
                onClick={() => handleNoteClick(option)}  // handle click event
              />
            ))
          }
      />
      {selectedNotes.length > 0 && <p>Last added note: {selectedNotes[selectedNotes.length - 1].name}</p>} {/* Display last selected note */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{selectedNote?.name} 
          <IconButton onClick={() => handleEditNoteClick(selectedNote?.id ?? 0)} size="small" style={{ marginLeft: 'auto' }}>  {/* Handle edit button click */}
            <EditIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                <div dangerouslySetInnerHTML={{ __html: selectedNote?.richText || "" }} />
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
       </Dialog>

    </FormControl>
    
  );
};

export default NoteSelector;
