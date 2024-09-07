import React, { useState, useEffect } from 'react';
import { useFetchData } from '../hooks/useFetchData';
import noteService from '../services/noteService';
import { useUserProfile } from '../contexts/UserProfileContext';
import { Note } from '../models/Note';
import { useKeycloak } from "@react-keycloak/web";
import { Tag } from '../models/Tag';
import NotesFilter from './NotesFilter';
import { useNavigate } from 'react-router-dom';
import { NoteTagInput } from './NoteTagInput';
import { Container, Typography, Grid, Button, Card, CardActionArea, CardContent, IconButton, Box } from '@mui/material';
import NoteForm from './NoteForm';

import { Add  } from '@mui/icons-material';

const NoteLandingPage: React.FC = () => {
  const [name, setName] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [richText, setRichText] = useState('');
  const [id, setId] = useState<number | undefined>(undefined);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localISOTime = (new Date(today.getTime() - (offset * 60 * 1000))).toISOString().slice(0,-1);
  const [recordedAt, setRecordedAt] = useState<string | undefined>(localISOTime.substring(0,16));
  const { keycloak } = useKeycloak();
  const { userProfile, setUserProfile } = useUserProfile();
  
  const navigate = useNavigate();

  const handleCreateNote = () => {
    navigate('/create-note');
  }

  return (
    <Grid container>
        <Grid item xs={12} sm={4} md={4} lg={2} className="sidebar">
            <NotesFilter keycloakSubject={userProfile?.keycloaksubject} />
        </Grid>
        <Grid item xs={12} sm={8} md={8} lg={10} className="main-content">
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card onClick={handleCreateNote} style={{ maxWidth: '200px' }}>
                        <CardActionArea>
                            <CardContent>
                                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" height="100%">
                                    <IconButton color="primary" aria-label="add note" component="span">
                                        <Add  style={{ fontSize: '5rem' }} />
                                    </IconButton>
                                    <Typography variant="h5" align="center">
                                        Blank Note
                                    </Typography>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
  );
};

export default NoteLandingPage;
