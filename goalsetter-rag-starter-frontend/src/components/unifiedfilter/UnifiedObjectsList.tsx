import React from 'react';
import { TypedTaggedObject } from './TypedTaggedObject';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface UnifiedObjectsListProps {
  objects: TypedTaggedObject[];
  onObjectStatusChange: (id: string | undefined, newStatus: string) => void;
  previousRoute: string;
  addTaskButton?: React.ReactNode;
}

const UnifiedObjectsList: React.FC<UnifiedObjectsListProps> = ({
  objects,
  onObjectStatusChange,
  previousRoute,
  addTaskButton,
}) => {
  return (
    <Box>
      {objects.map((object, index) => {
        let updateLink;
        switch (object.type) {
          case 'Task':
            updateLink = `/update-task/${object.id}`;
            return (
              <Box key={index}>
                <Typography variant="h6">
                  <Link to={updateLink}>Task: {object.title}</Link>
                </Typography>
                {/* Display other task properties and actions */}
              </Box>
            );
          case 'Goal':
            updateLink = `/update-goal/${object.id}`;
            return (
              <Box key={index}>
                <Typography variant="h6">
                  <Link to={updateLink}>Goal: {object.title}</Link>
                </Typography>
                {/* Display other goal properties and actions */}
              </Box>
            );
          case 'Note':
            updateLink = `/update-note/${object.id}`;
            return (
              <Box key={index}>
                <Typography variant="h6">
                  <Link to={updateLink}>Note: {object.title}</Link>
                </Typography>
                {/* Display other note properties and actions */}
              </Box>
            );
          default:
            return null;
        }
      })}
      {/* Your Add Task Button */}
      {addTaskButton}
    </Box>
  );
};

export default UnifiedObjectsList;

