// ClientSecretContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface ClientSecretContextData {
  clientSecret: string | null;
  setClientSecret: (clientSecret: string | null) => void;
}

const ClientSecretContext = createContext<ClientSecretContextData | undefined>(undefined);

interface ClientSecretProviderProps {
  children: React.ReactNode;
}

export const ClientSecretProvider: React.FC<ClientSecretProviderProps> = ({ children }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  return (
    <ClientSecretContext.Provider value={{ clientSecret, setClientSecret }}>
      {children}
    </ClientSecretContext.Provider>
  );
};

export const useClientSecret = (): ClientSecretContextData => {
  const context = useContext(ClientSecretContext);
  if (context === undefined) {
    throw new Error('useClientSecret must be used within a ClientSecretProvider');
  }
  return context;
};
