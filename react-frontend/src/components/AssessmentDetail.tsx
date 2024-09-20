import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gptAssessmentService from '../services/gptAssessmentService';
import { GPTAssessment } from '../models/GPTAssessment';
import AssessmentList from './AssessmentList';
import { Container, Typography, Button, Grid, Box, CircularProgress } from '@mui/material';
import { useUserProfile } from '../contexts/UserProfileContext';
import { TagInput } from './TagInput';
import { Tag } from '../models/Tag';

const AssessmentDetail: React.FC = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<GPTAssessment | null>(null);
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useUserProfile();

  useEffect(() => {
    async function fetchAssessment() {
      const response = await gptAssessmentService.get(id);
      setAssessment(response.data);
    }
    fetchAssessment();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTagsChange = async (newTags: Tag[]) => {
    if (assessment) {
      const updatedAssessment = { tags: newTags };
      const response = await gptAssessmentService.update(assessment.id.toString(), updatedAssessment);
      if (response.data) {
        setAssessment(response.data);
      }
    }
  };
  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(date);
  };

  function formatAssessmentText(text: string) {
    const recommendationsPattern = /Recommendations:/;
    const taskPattern = /Task \d+/g;
    const goalPattern = /Goal \d+/g;
    const listItemPattern = /\d+\./g;
  
    const formattedText = text
      .split('\n')
      .map((line) => {
        if (recommendationsPattern.test(line)) {
          return <Typography variant="h6" gutterBottom>{line}</Typography>;
        } else if (taskPattern.test(line) || goalPattern.test(line)) {
          return <Typography variant="subtitle1" gutterBottom>{line}</Typography>;
        } else if (listItemPattern.test(line)) {
          return (
            <Typography component="li" variant="body1">
              {line}
            </Typography>
          );
        } else {
          return <Typography variant="body1" paragraph>{line}</Typography>;
        }
      });
  
    return <>{formattedText}</>;
  }
  

  if (!assessment) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container>
      <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
        {userProfile ? <AssessmentList /> : <CircularProgress />}
      </Grid>
      <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
        <Box sx={{ paddingTop: '20px' }}>
            
        </Box>
        <Box mx={2}>
            <Typography variant="h4" component="h2">
              Past Assessments
            </Typography>
            <TagInput
              onTagsChange={handleTagsChange}
              userProfile={userProfile}
            />
            <Typography variant="h4" component="h2" gutterBottom sx={{ paddingTop: '20px' }}>
              {`Assessment Content on ${formatDate(assessment.createdAt)}`}
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom>
              Custom Question
            </Typography>
            <Typography variant="body1" gutterBottom>
              {assessment.customQuestion}
            </Typography>
            <Typography>{formatAssessmentText(assessment.assessment)}</Typography>
            <Button variant="contained" color="primary" onClick={handleGoBack}>
              Back
            </Button>
        </Box>
      </Grid>
    </Grid>
      
    
  );
};

export default AssessmentDetail;
