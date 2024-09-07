import React, { useState }  from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Modal,
  Button,
  Backdrop,
  Link
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { UserProfile } from '../models/UserProfile';
import { useUserProfile } from '../contexts/UserProfileContext';
import userProfileService from '../services/userProfileService';

const Account: React.FC = () => {
  const { userProfile, setUserProfile, federatedIdentities, discordRoles } = useUserProfile();
  const [openModal, setOpenModal] = useState(false);
  const discordIdentity = federatedIdentities.find(identity => identity.identityProvider === "discord");
  const hasFeatureRequestsRole = discordRoles.includes('1107930714529337396');

  const handleCancelSubscription = async () => {
    if (userProfile) {
      const updatedUserProfile: Partial<UserProfile> = {
        id: userProfile.id,
        subscriptionStatus: 'canceled',
      };

      const response = await userProfileService.update(
        userProfile.keycloaksubject,
        updatedUserProfile,
      );

      if (response.data) {
        setUserProfile({ ...userProfile, subscriptionStatus: 'canceled' });
      }
    }
    setOpenModal(false);
  };

  const handleModalOpen = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const hasActiveSubscription =
    userProfile &&
    (userProfile.subscriptionStatus === 'active' || userProfile.subscriptionStatus === 'past_due') &&
    (userProfile.planTier === 'basic' || userProfile.planTier === 'premium');

  const data = [
    {
      name: 'GPT API Quota',
      value: userProfile?.gptAPIQuota ?? 0,
    },
    {
      name: 'GPT API Quota Remaining',
      value: userProfile?.gptAPIQuotaRemaining ?? 0,
    },
  ];

  return (
    <Container maxWidth="md"sx={{
        paddingTop: '20px', // You can adjust the padding value to your preference
      }}>
      <Typography variant="h4" gutterBottom>
        Account
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardHeader title="Subscription Details" />
            <CardContent>
              <Typography variant="subtitle1">
                Status: {userProfile?.subscriptionStatus ?? 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Plan Tier: {userProfile?.planTier ?? 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Expiration Date:{' '}
                {userProfile?.subscriptionExpiresAt
                  ? new Date(userProfile.subscriptionExpiresAt).toLocaleDateString()
                  : 'N/A'}
              </Typography>
              {hasActiveSubscription && (
                <Box mt={4}>
                  <Button variant="contained" color="secondary" onClick={handleModalOpen}>
                    Cancel Subscription
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
          {discordIdentity && (
            <Card sx={{ marginTop: '16px' }}>
              <CardHeader title="Discord Details" />
              <CardContent>
                <Typography variant="subtitle1">
                  Discord Username: {discordIdentity.userName}
                </Typography>
                <Typography variant="subtitle1">
                  Discord User ID: {discordIdentity.userId}
                </Typography>
                <Box mt={2}>
                  <Link href="https://discord.com/channels/1102387985707704370/1102387985707704373" target="_blank" rel="noopener">
                    Goalora Discord General Chat
                  </Link>
                </Box>
                {hasFeatureRequestsRole && (
                  <Box mt={2}>
                    <Link href="https://discord.com/channels/1102387985707704370/1104058660730196099" target="_blank" rel="noopener">
                      Features Request Channel
                    </Link>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardHeader title="GPT API Quota" />
            <CardContent>
              <Box height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="cancel-subscription-modal-title"
        aria-describedby="cancel-subscription-modal-description"
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            padding: 2,
            borderRadius: 1,
            boxShadow: 24,
            minWidth: '50%',
          }}
        >
          <Typography id="cancel-subscription-modal-title" variant="h6" gutterBottom>
            Cancel Subscription
          </Typography>
          <Typography id="cancel-subscription-modal-description" variant="body1">
            Are you sure you want to cancel your subscription? You will be able to use your current quota until{' '}
            {userProfile?.subscriptionExpiresAt && new Date(userProfile.subscriptionExpiresAt).toLocaleDateString()}.
          </Typography>
          <Grid container justifyContent="center" alignItems="center" mt={2} spacing={2}>
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleCancelSubscription}>
                Confirm
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" onClick={handleModalClose}>
                Do Not Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Container>
  );
};

export default Account;
