import React, { useEffect, useState } from 'react';
import './AssessmentList.css';
import { useVisibilityChange } from "../hooks/useVisibilityChange";
import { GPTAssessment } from '../models/GPTAssessment';
import gptAssessmentService from '../services/gptAssessmentService';
import { useKeycloak } from '@react-keycloak/web';
import { Link, useLocation } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserProfileContext';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import tagService from '../services/tagService';
import TagSelect from './TagSelect';
import { Tag } from '../models/Tag';
import AssessmentListItem from './AssessmentListItem';
import AssessmentDetailModal from './AssessmentDetailModal';

import {
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Divider,
  Grid,
  Modal,
} from '@mui/material';

interface AssessmentListProps {
  goalId?: number | null;
  taskId?: number | null;
}

const AssessmentList: React.FC<AssessmentListProps> = ({ goalId, taskId }) => {

  const { keycloak } = useKeycloak();
  const [assessments, setAssessments] = useState<GPTAssessment[] | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<GPTAssessment | null>(null);
  const { userProfile, setUserProfile } = useUserProfile();
  const location = useLocation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isVisible = useVisibilityChange();

  useEffect(() => {
    const fetchTags = async () => {
      if (!userProfile?.keycloaksubject) return;
      const response: StrapiServiceResponse<Tag[]> = await tagService.getAll(userProfile.keycloaksubject);
      if (response.data) {
        setTags(response.data);
      }
    };
  
    fetchTags();
  }, [userProfile?.keycloaksubject]); 


  const fetchAssessments = async (subject: string | undefined, goalId: string | undefined) => {
    const goalFilter = goalId ? `&filters[goal][id][$eq]=${goalId}` : '&filters[goal][id][$null]=true';
    const taskFilter = taskId ? `&filters[tasks][id][$in]=${taskId}` : null;
    const response = await gptAssessmentService.getAll(subject + goalFilter + (taskFilter ? taskFilter : ''), 1);
    if (response.data) {
      setAssessments(response.data);
    }
  };
  
  useEffect(() => {
    fetchAssessments(userProfile?.keycloaksubject, goalId?.toString());
  }, [userProfile?.keycloaksubject, goalId, taskId, isVisible]);
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'Unknown Date';
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(date);
  };

  const handleTagSelection = async (selectedTags: Tag[]) => {
    let filteredAssessments: GPTAssessment[] | null = null;
  
    if (selectedTags.length === 0) {
      await fetchAssessments(userProfile?.keycloaksubject, goalId?.toString());
    } else {
      const response: StrapiServiceResponse<GPTAssessment[]> = await gptAssessmentService.getByTagsAndGoalId(selectedTags, goalId?.toString());
      if (response.data) {
        filteredAssessments = response.data;
      }
      setAssessments(filteredAssessments || []);
    }
  
    
  };

  const openModal = (assessment: GPTAssessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setSelectedAssessment(null);
    setIsModalOpen(false);
  };
  
  return (
    <>
       <TagSelect tags={tags} onSelectionChange={handleTagSelection}  />
       <div className="assessments-list">
       
        <h2>Assessments</h2>
        {assessments ? (
            
            <List>
              {assessments.map((assessment, index) => (
              <AssessmentListItem 
                key={index} 
                assessment={assessment} 
                index={index} 
                formatDate={formatDate} 
                openModal={taskId ? openModal : undefined}
                />
            ))}
            </List>
            
          ) : (
            <CircularProgress />
          )}
          <Modal
            open={isModalOpen}
            onClose={closeModal}
          >
            <AssessmentDetailModal assessment={selectedAssessment} />
          </Modal>
     </div> 
    </>
      
      
  );
};

export default AssessmentList;
