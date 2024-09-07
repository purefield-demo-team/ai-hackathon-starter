// src/context/UserProfileContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../models/UserProfile';
import userProfileService from '../services/userProfileService';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  federatedIdentities: any[]; // add state for federated identities
  setFederatedIdentities: React.Dispatch<React.SetStateAction<any[]>>; // add function to set state
  discordRoles: string[];
  setDiscordRoles: React.Dispatch<React.SetStateAction<string[]>>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

interface UserProfileProviderProps {
  children: React.ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { keycloak, initialized } = useKeycloak();
  const [federatedIdentities, setFederatedIdentities] = useState<any[]>([]);
  const [discordRoles, setDiscordRoles] = useState<string[]>([]);

  const createUserProfileFromKeycloak = async () => {
    const keycloakProfile = await keycloak.loadUserProfile();
    
    const currentDate = new Date();
    const subscriptionExpiresAt = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

    const userProfile: UserProfile = {
      keycloaksubject: keycloak.subject || "",
      roninWalletAddress: "",
      verified: false,
      verifiedTime: new Date(),
      preferredUsername: keycloakProfile.username || "",
      givenName: keycloakProfile.firstName || "",
      emailVerified: keycloakProfile.emailVerified || false,
      familyName: keycloakProfile.lastName || "",
      email: keycloakProfile.email || "",
      gptAPIQuota: 20,
      gptAPIQuotaRemaining: 20,
      subscriptionStatus: "active",
      planTier: "free",
      subscriptionExpiresAt: subscriptionExpiresAt,
      name: `${keycloakProfile.firstName || ""} ${keycloakProfile.lastName || ""}`,
    };

    return userProfile;
  };

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      const fetchOrCreateUserProfile = async () => {
        const response = await userProfileService.get(keycloak.subject!);
        if (response.data && response.data.id) {
          setUserProfile(response.data);
          setLoading(false);
          
        } else {
          const newUserProfile = await createUserProfileFromKeycloak();
          const createResponse = await userProfileService.create(newUserProfile);
          setUserProfile(createResponse.data);
          setLoading(false);
        }
        // Then fetch the federated identity.
        userProfileService.getFederatedIdentity('fihr-rag-llm', keycloak.subject!, keycloak.token!)
        .then(response => {
          setFederatedIdentities(response.data);
          
        });
      };

      fetchOrCreateUserProfile();
      
    } 
  }, [initialized, keycloak]);

  useEffect(() => {
    if (userProfile?.subscriptionStatus === 'active') {
      const discordIdentity = federatedIdentities.find((identity: { identityProvider: string }) => identity.identityProvider === 'discord');
      if (discordIdentity) {
        // Fetch the roles of the discord user
        axios.get(`https://http-to-discord-role-check-goalsetter.apps.ocpai.enterprisewebservice.com/checkRole?discordUser=${discordIdentity.userId}`)
        .then(response => {
          const roles = response.data.roles;
          // Check if the 'feature-requests' role is present
          if (!roles.includes('1107930714529337396')) {
            // If not, call the POST endpoint to assign the role
            axios.post(`https://http-to-discord-goalsetter.apps.ocpai.enterprisewebservice.com/assignRole?discordUser=${discordIdentity.userId}`)
              .then(() => {
                // Add the new role to the discordRoles state
                setDiscordRoles([...roles, '1107930714529337396']);
              });
          } else {
            // If the role is present, assign the roles to the discordRoles state
            setDiscordRoles(roles);
          }
        });
      }
    }
  }, [userProfile, federatedIdentities]);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile, loading, federatedIdentities, setFederatedIdentities, discordRoles, setDiscordRoles }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === null) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
