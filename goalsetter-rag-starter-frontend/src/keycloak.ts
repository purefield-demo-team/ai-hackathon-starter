// src/keycloak.ts
import Keycloak from 'keycloak-js';

const keycloak = Keycloak({
  "url": 'https://keycloak-fihr-rag.apps.salamander.aimlworkbench.com/', // Replace with your Keycloak server URL
  "realm": 'fihr-rag-llm',
  "clientId": 'fihr-rag-chat'
});

export default keycloak;
