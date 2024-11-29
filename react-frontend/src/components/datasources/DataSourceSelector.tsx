// DataSourceSelector.tsx
import React from 'react';
import { UserDataSource } from '../../models/UserDataSource';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';

interface DataSourceSelectorProps {
  userDataSources: UserDataSource[];
  currentDataSourceId: number | null;
  onDataSourceSelect: (selectedUserDataSource: UserDataSource) => void;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ userDataSources, currentDataSourceId, onDataSourceSelect }) => {
  return (
    <Box>
      <Typography variant="h6">Select Data Source</Typography>
      <Grid container spacing={2}>
        {userDataSources.map(userDataSource => (
          <Grid item xs={12} sm={6} md={4} key={userDataSource.id}>
            <Card
              onClick={() => onDataSourceSelect(userDataSource)}
              style={{
                cursor: 'pointer',
                border: currentDataSourceId === userDataSource.dataSource.id ? '2px solid blue' : '1px solid gray',
              }}
            >
              <CardContent>
                <Typography variant="h6">{userDataSource.dataSource.name}</Typography>
                <Typography variant="body2">{userDataSource.dataSource.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DataSourceSelector;
