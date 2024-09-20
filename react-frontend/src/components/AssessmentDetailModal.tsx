// AssessmentDetailModal.js
import { Box, Typography, Button } from '@mui/material';
import { GPTAssessment } from '../models/GPTAssessment';

interface AssessmentDetailModalProps {
  assessment: GPTAssessment | null;
}

const AssessmentDetailModal: React.FC<AssessmentDetailModalProps> = ({ assessment }) => {
  // Use the same formatDate function from AssessmentList
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(date);
  };

  if (!assessment) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'white', padding: '2em', margin: '2em auto', maxWidth: '90vw' }}>
      <Typography variant="h4" component="h2" gutterBottom>
        {`Assessment Content on ${formatDate(assessment.createdAt)}`}
      </Typography>
      <Typography variant="h6" component="h3" gutterBottom>
        Custom Question
      </Typography>
      <Typography variant="body1" gutterBottom>
        {assessment.customQuestion}
      </Typography>
      <Typography>{assessment.assessment}</Typography>
    </Box>
  );
};

export default AssessmentDetailModal;