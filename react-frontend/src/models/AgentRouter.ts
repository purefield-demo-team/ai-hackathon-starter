import { LlmAgentNode } from './LlmAgentNode';

export interface AgentRouter {
    name: string;
    description: string;
    startNode: LlmAgentNode;
}