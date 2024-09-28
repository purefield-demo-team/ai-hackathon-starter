// src/components/UsernameDisplay.tsx
import React, { useState } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { Typography, Menu, MenuItem, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import keycloak from '../keycloak';
import { useNavigate } from 'react-router-dom';


const UsernameDisplay: React.FC = () => {
  const { userProfile, loading, federatedIdentities } = useUserProfile();
  //const discordLinked = federatedIdentities.some(identity => identity.identityProvider === "discord");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    keycloak.logout();
  };
  
  const handleAccountClick = () => {
    navigate('/account');
    handleMenuClose();
  };

  const handleLinkDiscord = () => {
    window.open('https://ai-rag-starter-kit-keycloak.apps.rosa.rosa-t8j8w.ft2c.p3.openshiftapps.com/realms/fihr-rag-llm/account/#/security/linked-accounts', "_blank", "noreferrer");
    handleMenuClose();
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <IconButton
        edge="end"
        aria-label="account of current user"
        aria-haspopup="true"
        onClick={handleMenuOpen}
        color="inherit"
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          Welcome, {userProfile && userProfile.preferredUsername}
        </MenuItem>
        <MenuItem onClick={handleAccountClick}>Account</MenuItem>
        {
          // !discordLinked &&
          // <MenuItem onClick={handleLinkDiscord}>Link Discord</MenuItem>
        }
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default UsernameDisplay;
