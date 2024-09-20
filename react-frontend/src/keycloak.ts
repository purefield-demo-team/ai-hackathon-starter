// src/keycloak.ts
import Keycloak from 'keycloak-js';

const keycloak = Keycloak({
  "url": process.env.REACT_APP_KEYCLOAK_URL;, // Replace with your Keycloak server URL
  "realm": 'fihr-rag-llm',
  "clientId": 'fihr-rag-chat'
});

export default keycloak;
