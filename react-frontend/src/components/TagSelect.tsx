import React from 'react';
import { Tag } from '../models/Tag';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

interface TagSelectProps {
  tags: Tag[];
  selectedTags?: Tag[];
  onSelectionChange: (selectedTags: Tag[]) => void;
}

export const TagSelect: React.FC<TagSelectProps> = ({ tags, selectedTags, onSelectionChange }) => {
  const handleChange = (event: React.SyntheticEvent<Element, Event>, value: Tag[]) => {
    onSelectionChange(value);
  };

  return (
    <Box paddingBottom={2}>
      <Autocomplete
        multiple
        options={tags}
        getOptionLabel={(option) => option.name}
        onChange={handleChange}
        value={selectedTags} // Add this line
        renderInput={(params) => (
          <TextField {...params} label="Filter by tags" placeholder="Select tags to filter goals" />
        )}
      />
    </Box>
  );
};

export default TagSelect;
