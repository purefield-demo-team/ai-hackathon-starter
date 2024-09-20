import React, { useState, useEffect } from 'react';
import { Goal } from '../models/Goal';
import { Task } from '../models/Task';
import { Tag } from '../models/Tag';
import tagService from '../services/tagService';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { AutocompleteInputChangeReason } from '@mui/material';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { UserProfile } from '../models/UserProfile';

interface TagInputProps {
  goal?: Goal;
  task?: Task;
  onTagsChange: (tags: Tag[]) => void;
  userProfile: UserProfile | null | undefined;
}

export const TagInput: React.FC<TagInputProps> = ({ goal, task, onTagsChange, userProfile }) => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<Tag[]>(goal ? goal.tags : task ? task.tags : []);

  useEffect(() => {
    onTagsChange(tags);
  }, [tags]);

  const handleInputChange = async (event: React.SyntheticEvent<Element, Event>, value: string, reason: AutocompleteInputChangeReason) => {
    setInputValue(value);

    if (value.endsWith(',')) {
      const tagName = value.slice(0, -1).trim();
      if (tagName) {
        const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());

        if (!existingTag) {
          const response = await tagService.findByName(userProfile?.keycloaksubject, tagName);

          if (response.data && response.data.length > 0) {
            const updatedTags = [...tags, response.data[0]];
            if (JSON.stringify(tags) !== JSON.stringify(updatedTags)) {
              setTags(updatedTags);
            }
          } else {
            const newTag: Tag = {
              name: tagName,
              userProfile: userProfile || undefined, // Use the passed userProfile
            };
            const createdTagResponse = await tagService.create(newTag);

            if (createdTagResponse.data) {
              const updatedTags = [...tags, createdTagResponse.data];
              if (JSON.stringify(tags) !== JSON.stringify(updatedTags)) {
                setTags(updatedTags);
              }
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
        onChange={(event, value: (string | Tag)[]) => {
          console.log("executing onChange for tags");
          // Filter out non-Tag objects
          const filteredTags = value.filter((v): v is Tag => v instanceof Object);
        
          // Check if the filtered tags are actually different from the current tags
          const currentTagNames = tags.map(tag => tag.name).sort().join(',');
          const newTagNames = filteredTags.map(tag => tag.name).sort().join(',');
        
          if (currentTagNames !== newTagNames) {
            // Only update state if there's a difference
            setTags(filteredTags);
          }
        }}
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
