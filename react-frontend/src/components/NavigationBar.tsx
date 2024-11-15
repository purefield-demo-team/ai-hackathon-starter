import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, useMediaQuery, Box, useTheme, Menu, MenuItem } from '@mui/material';
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      <MenuItem component={RouterLink} to="/" onClick={handleMenuClose}>Dashboard</MenuItem>
      <MenuItem component={RouterLink} to="/create-goal" onClick={handleMenuClose}>Goals</MenuItem>
      <MenuItem component={RouterLink} to="/create-task" onClick={handleMenuClose}>Tasks</MenuItem>
      <MenuItem component={RouterLink} to="/notes" onClick={handleMenuClose}>Notes</MenuItem>
      <MenuItem disabled component={RouterLink} to="/create-llm-agent" onClick={handleMenuClose}>Agents</MenuItem>
      <MenuItem disabled component={RouterLink} to="/create-agent-router" onClick={handleMenuClose}>Agent Routers</MenuItem>
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
          <>
            <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleMenuClick}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {menuItems}
            </Menu>
          </>
        )}
        <Box sx={{ ml: 2 }}>
          <UsernameDisplay />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;