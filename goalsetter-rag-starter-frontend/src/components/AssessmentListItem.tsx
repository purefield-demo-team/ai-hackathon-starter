import { Link, useLocation } from 'react-router-dom';
import { GPTAssessment } from '../models/GPTAssessment';
import './AssessmentListItem.css';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

interface AssessmentListItemProps {
  assessment: GPTAssessment;
  index: number;
  formatDate: (dateString: string) => string;
}

const AssessmentListItem: React.FC<AssessmentListItemProps & { openModal?: (assessment: GPTAssessment) => void }> = ({ assessment, index, formatDate, openModal  }) => {
  
  const handleClick = () => {
    if (openModal) {
        openModal(assessment);
    }
  };  

  const location = useLocation();
  
  const assessmentPath = `/assessment-detail/${assessment.id}`;
  
  const isCurrentAssessment = location.pathname === assessmentPath;
  
  return (
    <ListItem
        button
        component={openModal ? 'div' : Link}
        to={openModal ? undefined : assessmentPath}
        onClick={handleClick}
        style={isCurrentAssessment ? {backgroundColor: "#e7b39ae7"} : {}}
    >
      <ListItemText primary={`Assessment ${index + 1} - ${formatDate(assessment.createdAt)}`} />
    </ListItem>
  );
};

export default AssessmentListItem;
