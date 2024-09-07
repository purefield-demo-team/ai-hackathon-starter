import React from 'react';
import { Link } from 'react-router-dom';
import { Note } from '../models/Note';
import './CreatedNotesList.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { Divider } from '@mui/material';
import { useTheme } from '@mui/system';
import { useMediaQuery } from '@mui/material';
import NoteListItem from './NoteListItem';
import { useMatch } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Add  } from '@mui/icons-material';

interface CreatedNotesListProps {
  notes: Note[] | null;
  onDeleteNote: (id: number | undefined) => Promise<boolean>;
}

const CreatedNotesList: React.FC<CreatedNotesListProps> = ({ notes, onDeleteNote }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const navigate = useNavigate();

  if (!notes || !Array.isArray(notes)) {
    return <div>Loading notes...</div>;
  }

  const handleDelete = (id: number | undefined) => {
    onDeleteNote(id);
  };

  const handleCreateNote = () => {
    navigate('/create-note');
  }

  return (
    <div className="notes-list">
    <h2>Notes <IconButton onClick={handleCreateNote} color="primary" aria-label="add note" component="span">
                                        <Add  style={{ fontSize: '3rem' }} />
                                    </IconButton></h2>
    <List>
      {notes.map((note) => (
        <React.Fragment key={note.id}>
          <NoteListItem note={note} onDeleteNote={onDeleteNote} />
          {isMobile && <Divider />}
        </React.Fragment>
      ))}
    </List>
  </div>
  );
};

export default CreatedNotesList;
