import { useMatch, Link, useLocation } from 'react-router-dom';
import { Note } from '../models/Note';
import './NoteListItem.css';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface NoteListItemProps {
  note: Note;
  onDeleteNote: (id: number | undefined) => Promise<boolean>;
}

const NoteListItem: React.FC<NoteListItemProps> = ({ note, onDeleteNote }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();  // prevent the default action
    const isDeleted = await onDeleteNote(note.id);
    if (isDeleted && isCurrentNote) {
      navigate('/notes');
    }
  };

  // Define a string to represent the path of the note
  const notePath = `/update-note/${note.id}`;

  // Check if the current location's pathname matches the note's path
  const isCurrentNote = location.pathname === notePath;

  return (
    <ListItem
        disablePadding
        className={isCurrentNote ? "notes-item highlighted" : "notes-item"}
        style={isCurrentNote ? {backgroundColor: "#e7b39ae7"} : {}}
        >
      <ListItemButton component={Link} to={notePath}>
        <ListItemText primary={note.name} />
      
        <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
};

export default NoteListItem;