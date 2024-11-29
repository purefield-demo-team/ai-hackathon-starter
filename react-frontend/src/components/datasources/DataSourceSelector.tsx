// DataSourceSelector.tsx
import React from 'react';
import { UserDataSource } from '../../models/UserDataSource';
import { Box, Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';

interface DataSourceSelectorProps {
  userDataSources: UserDataSource[];
  currentDataSourceId: number | null;
  onDataSourceSelect: (selectedUserDataSource: UserDataSource) => void;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  userDataSources,
  currentDataSourceId,
  onDataSourceSelect,
}) => {
  if (!userDataSources || userDataSources.length === 0) {
    return <Typography variant="body1">No data sources available.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6">Select Data Source</Typography>
      <Grid container spacing={2}>
        {userDataSources.map((userDataSource) => (
          <Grid item xs={12} sm={6} md={4} key={userDataSource.id}>
            <Card
              style={{
                border:
                  currentDataSourceId === userDataSource.dataSource.id
                    ? '2px solid blue'
                    : '1px solid gray',
              }}
            >
              <CardActionArea onClick={() => onDataSourceSelect(userDataSource)}>
                <CardContent>
                  <Typography variant="h6">
                    {userDataSource.dataSource.name}
                  </Typography>
                  <Typography variant="body2">
                    {userDataSource.dataSource.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DataSourceSelector;
