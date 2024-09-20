// src/services/userProfileService.ts
import api from '../api';
import axios from 'axios';
import { UserProfile } from '../models/UserProfile';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';

const userProfileService = {
  get: async (keycloakSubject: string): Promise<StrapiServiceResponse<UserProfile>> => {
    try {
      const response = await api.get(`/user-profiles?filters[keycloaksubject][$eq]=${keycloakSubject}`);
      const userProfile = response.data.data.length > 0 ? response.data.data[0] : null;
      const result: StrapiServiceResponse<UserProfile> = { data: userProfile, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<UserProfile> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  create: async (userProfile: UserProfile): Promise<StrapiServiceResponse<UserProfile>> => {
    try {
      userProfile.subscriptionStatus = 'inactive';
      userProfile.subscriptionExpiresAt = new Date();
      
      const response = await api.post('/user-profiles', {data: userProfile});
      const result: StrapiServiceResponse<UserProfile> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<UserProfile> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  update: async (keycloakSubject: string, userProfile: UserProfile | Partial<UserProfile>): Promise<StrapiServiceResponse<UserProfile>> => {
    try {
    
      const response = await api.put(`/user-profiles/${userProfile.id}`, {data:userProfile});
      const result: StrapiServiceResponse<UserProfile> = { data: response.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<UserProfile> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  delete: async (keycloakSubject: string): Promise<StrapiServiceResponse<boolean>> => {
    try {
      await api.delete(`/user-profiles/${keycloakSubject}`);
      const result: StrapiServiceResponse<boolean> = { data: true, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = { data: false, error: error as ErrorResponse };
      return result;
    }
  },
  getOrCreate: async (keycloakSubject: string): Promise<StrapiServiceResponse<UserProfile>> => {
    try {
      const getResponse = await userProfileService.get(keycloakSubject);

      if (getResponse.data && getResponse.data.id) {
        return getResponse;
      } else {
        // Create a new UserProfile object if one does not exist
        const newUserProfile: UserProfile = {
          keycloaksubject: keycloakSubject,
          // Set other UserProfile properties as needed, e.g., empty strings or default values
          roninWalletAddress: '',
          verified: false,
          verifiedTime: new Date(),
          preferredUsername: '',
          givenName: '',
          emailVerified: false,
          familyName: '',
          email: '',
          name: ''
        };
        const createResponse = await userProfileService.create(newUserProfile);
        return createResponse;
      }
    } catch (error) {
      const result: StrapiServiceResponse<UserProfile> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getFederatedIdentity: async (realm: string, userId: string, token: string): Promise<any> => {
    try {
      const response = await axios.get(
        `https://keycloak-fihr-rag.apps.salamander.aimlworkbench.com/admin/realms/${realm}/users/${userId}/federated-identity`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },
  
};

export default userProfileService;
