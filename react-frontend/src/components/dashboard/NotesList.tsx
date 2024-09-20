import React from 'react';
import { Note } from '../../models/Note';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ListItemButton } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { alpha } from '@mui/system';

interface NotesListProps {
  notes: Note[];
  onNoteSelection?: (note: Note) => void;
  selectedNotes?: Note[];
}

export const NotesList: React.FC<NotesListProps> = ({ notes, onNoteSelection, selectedNotes }) => {
    const handleNoteClick = (note: Note) => {
      if (onNoteSelection) {
        onNoteSelection(note);
      }
    };
  
    return (
      <List>
        {notes.map((note) => (
          <ListItem key={note.id} disablePadding>
            <ListItemButton
              onClick={() => handleNoteClick(note)}
              selected={selectedNotes?.some((selectedNote) => selectedNote.id === note.id)}
            >
              <ListItemText primary={note.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };
  
  

export default NotesList;
