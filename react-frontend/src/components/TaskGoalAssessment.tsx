import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Goal } from "../models/Goal";
import { Note } from "../models/Note";
import { getTaskGoalAssessment } from "../utils/chatGPT";
import goalService from "../services/goalService";
import { useKeycloak } from "@react-keycloak/web";
import { useFetchData } from "../hooks/useFetchData";
import { useFetchGoals } from "../hooks/useFetchGoals";
import { Tag } from "../models/Tag";
import { TagInput } from "./TagInput";

import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  CircularProgress,
  Divider,
  TextField,
  Modal, // Add this import
  Backdrop, // Add this import
} from "@mui/material";
import gptAssessmentService from "../services/gptAssessmentService";
import { GPTAssessment } from "../models/GPTAssessment";
import { useUserProfile } from "../contexts/UserProfileContext";
import AssessmentList from "./AssessmentList";
import { PulseLoader } from "react-spinners";
import { StrapiServiceResponse } from "../types/StrapiServiceResponse";

interface TaskGoalAssessmentProps {
  goalId?: number;
  selectedGoals?: Goal[];
  selectedNotes?: Note[];
}

const TaskGoalAssessment: React.FC<TaskGoalAssessmentProps> = ({
  goalId,
  selectedGoals,
  selectedNotes,
}) => {
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const { keycloak } = useKeycloak();
  const [assessment, setAssessment] = useState<string | null>(null);
  const { userProfile, setUserProfile } = useUserProfile();
  const [refresh, setRefresh] = useState(false);
  const analysisContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>([]);


  
  const handlePreviousButtonClick = () => {
    navigate(`/update-goal/${goalId}`);
   };

  const handleCustomQuestionChange = useCallback((value: any) => {
    setCustomQuestion(value);
  }, []);

  async function fetchGoals(
    goalId: number | undefined,
    keycloakSubject: string | undefined
  ): Promise<StrapiServiceResponse<Goal[]>> {
    if (goalId) {
      const goalResponse = await goalService.get(goalId);
      if (!goalResponse.error && goalResponse.data) {
        return { error: null, data: [goalResponse.data] };
      } else {
        return { error: goalResponse.error, data: null };
      }
    } else {
      return { error: null, data: selectedGoals || [] };
    }
  }
  
  
  const {
    data: fetchedGoals,
    error: goalsError,
    isLoading: goalsLoading,
  } = useFetchGoals(goalId, keycloak.subject);
  
  const goals = fetchedGoals?.flat() || selectedGoals || [];

  const isLoading = goalsLoading;
  const [fetchingAssessment, setFetchingAssessment] = useState<boolean>(
    false
  );

  useEffect(() => {
    if (analysisContainerRef.current) {
      analysisContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [fetchingAssessment]);
  const refreshAssessments = () => {
    setRefresh((prev) => !prev);
  };

  const showModal = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    navigate("/subscription");
  };

  const handleTagsChange = (tags: Tag[]) => {
    setTags(tags);
  };
  

  const fetchAssessment = async (customPrompt?: string) => {
    // Check if goals are loaded
    if (!isLoading && goals !== null) {
      setFetchingAssessment(true);
      try {
        const result = await getTaskGoalAssessment(
          undefined,
          goals,
          customPrompt,
          selectedNotes,
          showModal,
          userProfile,
        );
        setAssessment(result || "No assessment available");
        const gptAssessment: Partial<GPTAssessment> = {
          assessment: result,
          userProfile: userProfile || undefined,
          ...(goalId ? { goal: goals[0] } : {}),
          tags: tags,
          customQuestion: customPrompt,
          notes: selectedNotes,
        };
        await gptAssessmentService.create(gptAssessment as GPTAssessment);
        refreshAssessments();
      } catch (error) {
        console.error("Error fetching assessment:", error);
      } finally {
        setFetchingAssessment(false);
      }
    }
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

  return (
    <>
      {/* {selectedGoals && selectedGoals.length > 0 && (
        <Box>
          <Typography variant="h6">Selected Goals:</Typography>
          <ul>
            {selectedGoals.map((goal) => (
              <li key={goal.id}>{goal.title}</li>
            ))}
          </ul>
        </Box>
      )}
      {selectedNotes && selectedNotes.length > 0 && (
        <Box>
          <Typography variant="h6">Selected Notes:</Typography>
          <ul>
            {selectedNotes.map((note) => (
              <li key={note.id}>{note.name}</li>
            ))}
          </ul>
        </Box>
      )} */}
      <Typography variant="body1" gutterBottom>
        Tag your assessment for easy retrieval later:
      </Typography>
      <Grid xs={12} item>
        <TagInput onTagsChange={handleTagsChange} userProfile={userProfile} />
      </Grid>
      <Typography variant="body1" gutterBottom>
        Enter a custom question about your goals, notes and tasks or leave it empty to use the default analyzer:
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={customQuestion}
            onChange={(event) => handleCustomQuestionChange(event.target.value)}
            variant="outlined"
          />
          </Box>
        </Grid>
        <Grid container justifyContent="space-between" alignItems="center" mt={2}>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={() => fetchAssessment(customQuestion)}>
              Analyze
            </Button>
          </Grid>
          {goalId ? (<Grid item>
            <Button variant="contained" color="secondary" onClick={() => handlePreviousButtonClick()}>
              Previous
            </Button>
          </Grid>) : ('')}
        </Grid>
      </Grid>
      <Box
        ref={analysisContainerRef}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: fetchingAssessment ? "400px" : "auto",
          maxHeight: "400px",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "0.4em",
          },
          "&::-webkit-scrollbar-track": {
            boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: "3px",
          },
        }}
      >
        {fetchingAssessment ? (
          <PulseLoader color="#3f51b5" loading={fetchingAssessment} size={15} margin={5} />
        ) : (
          <>
            {assessment ? (
              <Box className="chat-response" sx={{ paddingTop: "20px" }}>
                {formatAssessmentText(assessment)}
              </Box>
            ) : (
              <Typography variant="body1">Click the "Analyze" button to load assessment.</Typography>
            )}
          </>
        )}
      </Box>
      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="subscription-warning-modal-title"
        aria-describedby="subscription-warning-modal-description"
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            padding: 2,
            borderRadius: 1,
            boxShadow: 24,
            minWidth: "50%",
          }}
        >
          <Typography id="subscription-warning-modal-title" variant="h6" gutterBottom>
            Subscription Required
          </Typography>
          <Typography id="subscription-warning-modal-description" variant="body1">
            You have exceeded your allotted GPT API requests. Please subscribe to continue using the service.
          </Typography>
          <Grid container justifyContent="center" alignItems="center" mt={2}>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={handleModalClose}>
                OK
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export default TaskGoalAssessment;
