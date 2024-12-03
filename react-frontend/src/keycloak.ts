// src/keycloak.ts
import Keycloak from 'keycloak-js';

const keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL;

if (!keycloakUrl) {
  throw new Error('REACT_APP_KEYCLOAK_URL environment variable is not set');
}

const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: 'fihr-rag-llm',
  clientId: 'fihr-rag-chat'
});

export default keycloak;
