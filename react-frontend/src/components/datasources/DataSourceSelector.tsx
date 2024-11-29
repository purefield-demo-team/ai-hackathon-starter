// DataSourceSelector.tsx
import React from 'react';
import { UserDataSource } from '../../models/UserDataSource';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  CardMedia,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

  var  backendUrl = process.env.REACT_APP_STRAPI_API_URL;
  if(backendUrl != undefined) {
    backendUrl = backendUrl.slice(0, -4);
  }
  if (!userDataSources || userDataSources.length === 0) {
    return <Typography variant="body1">No data sources available.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Data Source
      </Typography>
      <Grid container spacing={2}>
        {userDataSources.map((userDataSource) => {
          const isSelected =
            currentDataSourceId === userDataSource.dataSource.id;
          return (
            <Grid item xs={12} sm={6} md={4} key={userDataSource.id}>
              <Card
                style={{
                  border: isSelected ? '2px solid #4caf50' : '1px solid gray',
                  position: 'relative',
                }}
              >
                <CardActionArea
                  onClick={() => onDataSourceSelect(userDataSource)}
                >
                  {/* Display the green checkmark if selected */}
                  {isSelected && (
                    <CheckCircleIcon
                      style={{
                        color: '#4caf50',
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: 32,
                      }}
                    />
                  )}
                  {/* Optional: Add an image or icon representing the data source */}
                  {userDataSource.dataSource.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={backendUrl + userDataSource.dataSource.image.url}
                      alt={userDataSource.dataSource.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">
                      {userDataSource.dataSource.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {userDataSource.dataSource.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DataSourceSelector;
