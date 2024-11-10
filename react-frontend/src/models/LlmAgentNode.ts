import { LlmAgent } from './LlmAgent';

export interface LlmAgentNode {
    id?: number;
    outputAgent: LlmAgent;
    inputAgents: LlmAgentNode[];
}