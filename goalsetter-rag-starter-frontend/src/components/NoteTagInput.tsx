// TagInput.tsx
import React, { useState, useEffect } from 'react';
import { Note } from '../models/Note';
import { Tag } from '../models/Tag';
import tagService from '../services/tagService';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { AutocompleteInputChangeReason } from '@mui/material';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';


interface TagInputProps {
  note: Note;
  keycloakSubject: string | undefined;
  onTagsChange: (tags: Tag[]) => void;
}

export const NoteTagInput: React.FC<TagInputProps> = ({ note, keycloakSubject, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<Tag[]>(note.tags);

  useEffect(() => {
    setTags(note.tags);
  }, [note.tags]);
  

  useEffect(() => {
    const handleTagsChange = () => {
      onTagsChange(tags);
    };
  
    // Call the handleTagsChange function when the component is mounted or when the dependencies change
    handleTagsChange();
  
    // Cleanup function will be called when the component is unmounted or when the dependencies change again
    return () => {
      // You can perform cleanup tasks here, if needed
    };
  }, [tags]);
  

  const handleInputChange = async (event: React.SyntheticEvent<Element, Event>, value: string, reason: AutocompleteInputChangeReason) => {
    setInputValue(value);

    if (value.endsWith(',')) {
      const tagName = value.slice(0, -1).trim();
      if (tagName) {
        const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());

        if (!existingTag) {
          const response = await tagService.findByName(keycloakSubject, tagName);

          if (response.data && response.data.length > 0) {
            setTags([...tags, response.data[0]]);
          } else {
            const newTag: Tag = { name: tagName, userProfile: note.userProfile };
            const createdTagResponse = await tagService.create(newTag);

            if (createdTagResponse.data) {
              setTags([...tags, createdTagResponse.data]);
            }
          }
        }
      }

      setInputValue('');
    }
  };

  return (
    <Box paddingBottom={2}>
        <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={tags}
            inputValue={inputValue}
            onChange={(event, value: (string | Tag)[]) => setTags(value.filter((v): v is Tag => v instanceof Object))}
            onInputChange={handleInputChange}
            renderTags={(value: Tag[], getTagProps) =>
                value.map((tag, index) => (
                    <Chip label={tag.name} {...getTagProps({ index })} />
                ))
            }
            renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Enter tags separated by commas" />
            )}
            />
    </Box>
  );
};
