import React from 'react';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { Section as SectionType } from '../utils/textUtils';

type SectionProps = SectionType;

const AssessmentSection: React.FC<SectionProps> = ({ number, title, content }) => {
  const lines = content.split('\n');
  const listItemRegex = /^-\s(.*)/;

  return (
    <Box mb={2}>
      <Typography variant="h5" component="h3" gutterBottom>
        {number}. {title}
      </Typography>
      <List>
        {lines.map((line, index) => {
          const listItemMatch = line.match(listItemRegex);
          if (listItemMatch) {
            return (
              <ListItem key={index}>
                <ListItemText primary={listItemMatch[1]} />
              </ListItem>
            );
          }
          return (
            <Typography key={index} variant="body1">
              {line}
            </Typography>
          );
        })}
      </List>
    </Box>
  );
};

export default AssessmentSection;
