import React, { useState } from 'react';
import { useEffect } from 'react';
import { StripeError } from '@stripe/stripe-js';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ClientSecretProvider, useClientSecret } from '../contexts/ClientSecretContext';
import { UserProfile, SubscriptionStatus } from '../models/UserProfile';
import userProfileService from '../services/userProfileService';
import { useUserProfile } from '../contexts/UserProfileContext';
import { Container, Typography, Button, Box, Grid } from '@mui/material';
import './Subscription.css';

const stripePromise = loadStripe('pk_live_51MxDKIJzOPb9siYpx8iuKDnoE2QTV8EJ6XcDXy5KXpFeCWF0ZyFNfaiXQ82IKn0UIlLQZbX3p6AvHfdxxrZ6gNwQ008ET35xWN');

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { clientSecret, setClientSecret } = useClientSecret();
  const { userProfile, setUserProfile } = useUserProfile();

  const updateSubscriptionStatus = async (status: SubscriptionStatus) => {
    if (!userProfile) return;

    // Get the current date and add one month to it
    const currentDate = new Date();
    const newExpiresAt = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

    const updatedUserProfile: UserProfile = {
      ...userProfile,
      subscriptionStatus: status,
      subscriptionExpiresAt: newExpiresAt,
      gptAPIQuotaRemaining: 125,
      gptAPIQuota: 125,
    };
    // Update the userProfile in the database
    const result = await userProfileService.update(userProfile.keycloaksubject, updatedUserProfile);
    if (result.error) {
      console.error('Error updating user profile:', result.error);
    } else {
      setUserProfile(result.data);
    }
  };

  const handleError = (error: StripeError) => {
    console.log(error.message);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      handleError(submitError);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      clientSecret: clientSecret,
      confirmParams: {
        // Return URL where the customer should be redirected after the PaymentIntent is confirmed.
        return_url: 'https://app.goalora.com/account',
      },
    });

    if (result.error) {
      handleError(result.error);
    } else {
      console.log('Payment confirmed');
      // Set the new subscription status and expiration date
      const newStatus: SubscriptionStatus = 'active';
      updateSubscriptionStatus(newStatus);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Subscribe For GPT4 Powered Goal Achievement</Typography>
      <form className="subscription-form-display" onSubmit={handleSubmit}>
        <PaymentElement />
        <button disabled={!stripe}>Submit</button>
      </form>
    </Container>
    
  );
};

const Subscription: React.FC = () => {
  const { clientSecret, setClientSecret } = useClientSecret();
  const { userProfile, setUserProfile } = useUserProfile();

  const getClientSecret = async () => {
    const response = await fetch('https://stripe-backend-goalsetter.apps.ocpai.enterprisewebservice.com/paymentintent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keycloaksubject: userProfile?.keycloaksubject,
      }),
    });
    const { client_secret } = await response.json();
    setClientSecret(client_secret);
  };

  useEffect(() => {
    if (userProfile) {
      getClientSecret();
    }
  }, [userProfile]);

  const options = {
    // passing the client secret obtained from the server
    clientSecret: clientSecret as string,
  };

  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
};

const WrappedSubscription: React.FC = () => {
  return (
    <ClientSecretProvider>
      <Subscription />
    </ClientSecretProvider>
  );
};

export default WrappedSubscription;
