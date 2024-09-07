// src/components/AuthenticatedComponent.tsx
import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useUserProfile } from '../contexts/UserProfileContext';

interface AuthenticatedComponentProps {
  children: React.ReactNode;
}

const AuthenticatedComponent: React.FC<AuthenticatedComponentProps> = ({
  children,
}) => {
  const { keycloak } = useKeycloak();
  const { userProfile, loading } = useUserProfile();

  if (
    !(typeof keycloak.authenticated === 'undefined') &&
    !keycloak.authenticated
  ) {
    keycloak.login();
    return null;
  }

  if (loading || !userProfile) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthenticatedComponent;
