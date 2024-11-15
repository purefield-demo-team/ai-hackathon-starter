import React, { useState, useEffect } from 'react';
import { Goal } from '../models/Goal';
import { Task } from '../models/Task';
import { Tag } from '../models/Tag';
import tagService from '../services/tagService';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import {
  AutocompleteInputChangeReason,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from '@mui/material';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { UserProfile } from '../models/UserProfile';

interface TagInputProps {
  goal?: Goal;
  task?: Task;
  onTagsChange: (tags: Tag[]) => void;
  userProfile: UserProfile | null | undefined;
}

type OptionType = Tag; // Your Tag type

const filter = createFilterOptions<OptionType>();

export const TagInput: React.FC<TagInputProps> = ({
  goal,
  task,
  onTagsChange,
  userProfile,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<(OptionType | string)[]>(
    goal ? goal.tags : task ? task.tags : []
  );
  const [options, setOptions] = useState<OptionType[]>([]); // Options for autocomplete

  useEffect(() => {
    // Filter out strings (new tags not yet created) when passing to onTagsChange
    const onlyTags = tags.filter((tag): tag is Tag => typeof tag !== 'string');
    onTagsChange(onlyTags);
  }, [tags]);

  // Fetch tags matching the input value
  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    (async () => {
      const response = await tagService.findByName(userProfile?.keycloaksubject, inputValue);
      if (active && response.data) {
        setOptions(response.data);
      }
    })();

    return () => {
      active = false;
    };
  }, [inputValue]);

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(value);
  };

  const handleChange = async (
    event: React.SyntheticEvent<Element, Event>,
    value: (OptionType | string)[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<OptionType | string>
  ) => {
    const newTags: (OptionType | string)[] = [];
    for (const item of value) {
      if (typeof item === 'string') {
        // This is a new tag (string value), create it
        const newTag: Tag = {
          name: item,
          userProfile: userProfile || undefined,
        };
        const createdTagResponse = await tagService.create(newTag);
        if (createdTagResponse.data) {
          newTags.push(createdTagResponse.data);
        }
      } else {
        // Existing tag
        newTags.push(item);
      }
    }
    setTags(newTags);
  };

  return (
    <Box paddingBottom={2}>
      <Autocomplete<OptionType, true, undefined, true>
        multiple
        freeSolo
        options={options}
        value={tags}
        inputValue={inputValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          // Suggest the creation of a new tag
          const { inputValue } = params;
          const isExisting = options.some(
            (option) => option.name.toLowerCase() === inputValue.toLowerCase()
          );

          if (inputValue !== '' && !isExisting) {
            filtered.push({
              name: inputValue,
            } as OptionType);
          }

          return filtered;
        }}
        getOptionLabel={(option) => {
          // For new tags (strings), display the string
          if (typeof option === 'string') {
            return option;
          }
          // For existing tags, display the tag name
          return option.name;
        }}
        renderOption={(props, option) => (
          <li {...props}>
            {typeof option === 'string' ? `Add "${option}"` : option.name}
          </li>
        )}
        isOptionEqualToValue={(option, value) => {
          if (typeof option === 'string' || typeof value === 'string') {
            return false;
          }
          return option.id === value.id;
        }}
        renderTags={(value: (OptionType | string)[], getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={typeof option === 'string' ? option : option.name}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label="Tags" placeholder="Enter tags" />
        )}
      />
    </Box>
  );
};
