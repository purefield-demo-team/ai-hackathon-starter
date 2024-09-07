import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, useMediaQuery, Hidden, Box, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink } from 'react-router-dom';
import UsernameDisplay from './UsernameDisplay';
import { useUserProfile } from '../contexts/UserProfileContext';
import { isPast } from "date-fns";
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';

const NavigationBar: React.FC = () => {
  const { userProfile, setUserProfile } = useUserProfile();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
 

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  let showSubscribeLink: boolean = true;
  if (userProfile) {
    showSubscribeLink =
      (userProfile.subscriptionStatus !== "active" ||
        userProfile.gptAPIQuotaRemaining === 0 ||
        (userProfile.subscriptionExpiresAt &&
          isPast(new Date(userProfile.subscriptionExpiresAt)))) ??
      true;
  }

  const menuItems = (
    <>
      {showSubscribeLink && (
        <Button color="inherit" component={RouterLink} to="/subscription">
          Subscribe
        </Button>
      )}
      <Button color="inherit" component={RouterLink} to="/create-goal">Goals</Button>
      <Button color="inherit" component={RouterLink} to="/create-task">Tasks</Button>
      <Button color="inherit" component={RouterLink} to="/notes">Notes</Button>
      <Button color="inherit" component={RouterLink} to="/task-goal-assessment">Assess</Button>
      <UsernameDisplay />
    </>
  );

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="home"
        component={RouterLink}
        to="/"
        sx={{ padding: 0 }} // Remove padding around the IconButton
      >
        {/* Replace HomeIcon with your logo */}
        <img
          src="/white-logo.svg" // Replace with the correct path to your logo.svg file
          alt="Logo"
          style={{ height: '36px' }} // Adjust the height as needed
        />
      </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          
        </Typography>
        {isMobile ? (
          <>
            <IconButton edge="end" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
              <Box sx={{ width: 250, p: 2 }}>
                {menuItems}
              </Box>
            </Drawer>
          </>
        ) : (
          menuItems
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
