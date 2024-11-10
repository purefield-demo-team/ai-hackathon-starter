import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import UpdateGoal from './components/UpdateGoal';
import UpdateTask from './components/UpdateTask';
import keycloak from './keycloak';
import AuthenticatedComponent from './components/AuthenticatedComponent';
import CreateGoal from './components/CreateGoal';
import CreateNote from './components/CreateNote';
import CreateTask from './components/CreateTask';
import CreateLlmAgent from './components/CreateLlmAgent';
import UpdateNote from './components/UpdateNote';
import { UserProfileProvider } from './contexts/UserProfileContext';
import UsernameDisplay from './components/UsernameDisplay';
import TaskGoalAssessment from './components/TaskGoalAssessment';
import Subscription from './components/Subscription';
import NavigationBar from './components/NavigationBar';
import Account from './components/Account';
import Dashboard from './components/Dashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TagProvider } from './contexts/TagContext';
import { TaskProvider } from './contexts/TaskContext';
import logo from './logo.svg';
import './App.css';
import AssessmentDetail from './components/AssessmentDetail';
import GoalSpecificTaskGoalAssessment from './components/GoalSpecificTaskGoalAssessment';
import TaskGoalAssessmentWithFilter from './components/TaskGoalAssessmentWithFilter';
import NoteLandingPage from './components/NoteLandingPage';

const onKeycloakReady = () => {
  console.log('Keycloak is ready');
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6F61', // Vibrant, gender-neutral coral color
    },
    secondary: {
      main: '#0ABAB5', // Tiffany blue color
    },
  },
  typography: {
    fontFamily: "'Roboto Slab', serif",
  },
});

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={{
      checkLoginIframe: false,
    }} onEvent={onKeycloakReady}>
      <UserProfileProvider>
        <TagProvider>
          <TaskProvider>
              <Router>
                <ThemeProvider theme={theme}>
                <NavigationBar />
                  <Routes>
                    {/* Default route */}
                    <Route path="/" element={<AuthenticatedComponent><Dashboard /></AuthenticatedComponent>} />
                    <Route path="/create-goal" element={<AuthenticatedComponent><CreateGoal /></AuthenticatedComponent>} />
                    <Route path="/create-note" element={<AuthenticatedComponent><CreateNote /></AuthenticatedComponent>} />
                    <Route path="/notes" element={<AuthenticatedComponent><NoteLandingPage /></AuthenticatedComponent>} />
                    <Route path="/update-note/:id" element={<AuthenticatedComponent><UpdateNote /></AuthenticatedComponent>} />
                    <Route path="/update-goal/:id" element={<AuthenticatedComponent><UpdateGoal /></AuthenticatedComponent>} />
                    <Route path="/create-task" element={<AuthenticatedComponent><CreateTask /></AuthenticatedComponent>} />
                    <Route path="/update-task/:id" element={<AuthenticatedComponent><UpdateTask /></AuthenticatedComponent>} />
                    <Route path="/task-goal-assessment" element={<AuthenticatedComponent><TaskGoalAssessmentWithFilter /></AuthenticatedComponent>} />
                    <Route path="/subscription" element={<AuthenticatedComponent><Subscription /></AuthenticatedComponent>} />
                    <Route path="/account" element={<AuthenticatedComponent><Account /></AuthenticatedComponent>} />
                    <Route path="/assessment-detail/:id" element={<AuthenticatedComponent><AssessmentDetail /></AuthenticatedComponent>} />
                    <Route path="/assessment/:id" element={<AuthenticatedComponent><GoalSpecificTaskGoalAssessment /></AuthenticatedComponent>} />
                    <Route path="/create-llm-agent" element={<AuthenticatedComponent><CreateLlmAgent /></AuthenticatedComponent>} />
                    {/* Add other routes as necessary */}
                  </Routes>
                </ThemeProvider>
              </Router>
          </TaskProvider>
        </TagProvider>
      </UserProfileProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
