import axios from 'axios';
import React, { useEffect } from 'react';
import { useKeycloak } from "@react-keycloak/web";
import keycloak from './keycloak';

const backendUrl = 'https://prod-strapi-strapi.apps.salamander.aimlworkbench.com/api'; // Replace with your backend URL

const api = axios.create({
  baseURL: backendUrl,
});

const isTokenExpired = () => {
  const expiry = localStorage.getItem('jwtExpiry');
  if (!expiry) return true;
  return Date.now() > parseInt(expiry, 10);
};

const storeToken = (jwt: string, expiresIn: number) => {
  localStorage.setItem('jwt', jwt);
  localStorage.setItem('jwtExpiry', (Date.now() + expiresIn * 1000).toString());
};


const removeToken = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('jwtExpiry');
};

function getTokenExpiration(jwt: string): number {
  if (!jwt) {
    throw new Error('No JWT provided');
  }

  // Split the JWT into its components
  const tokenParts = jwt.split('.');
  if (tokenParts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  // Decode the payload (the second part of the JWT)
  const payloadBase64Url = tokenParts[1];
  const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payloadJson = atob(payloadBase64);
  const payload = JSON.parse(payloadJson);

  // Get the expiration time from the payload
  const expirationTime = payload.exp;
  if (!expirationTime) {
    throw new Error('No expiration time found in the JWT payload');
  }

  return expirationTime;
}


const getToken = async () => {
  let jwt = localStorage.getItem('jwt');
  if (!jwt || isTokenExpired()) {
    try {
      await keycloak.updateToken(5);
      const response = await fetch(
        `${backendUrl}/auth/keycloak/callback?id_token=${keycloak.idToken}&access_token=${keycloak.token}`
      );

      if (response.status !== 200) {
        throw new Error(`Couldn't login to Strapi. Status: ${response.status}`);
      }

      const data = await response.json();
      const expirationTime = getTokenExpiration(data.jwt);
      console.log(`Token expires at: ${new Date(expirationTime * 1000)}`);
      storeToken(data.jwt, expirationTime); // Store token with expiration time
      localStorage.setItem('username', data.user.username);
      jwt = data.jwt;
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  }

  return jwt;
};

api.interceptors.response.use(
  (response) => {
      return response; // If the response was successful, just return it.
  },
  async (error) => {
      const originalRequest = error.config;

      // If a 401 response is received, and this isn't a retry request.
      if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // mark the request as a retry

          // Clear the JWT token.
          removeToken();

          // Optionally, you can re-authenticate and get a new token here and then retry the request.

          // Re-authenticate the user to get a new token
          try {
              const newToken = await getToken(); // Assuming this re-authenticates and gets a new token

              // Update the header for the original request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Return the original request with the new token to complete the call
              return api(originalRequest);
          } catch (authError) {
              console.error('Re-authentication failed:', authError);
              return Promise.reject(error);
          }
      }

      // If the error isn't 401 or something else, reject the promise.
      return Promise.reject(error);
  }
);

// Add a request interceptor
api.interceptors.request.use(
  (config) =>
    new Promise(async (resolve, reject) => {
      try {
        const token = await getToken(); // Use await when calling getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        resolve(config);
      } catch (error) {
        removeToken(); // Remove expired token
        reject(error);
      }
    }),
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
