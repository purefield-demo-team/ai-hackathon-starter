import { LlmAgentNode } from './LlmAgentNode';

export interface AgentRouter {
    id?: number;
    name: string;
    description: string;
    startNode: LlmAgentNode;
}