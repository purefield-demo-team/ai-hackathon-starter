import { LlmAgent } from './LlmAgent';

export interface LlmAgentNode {
    outputAgent: LlmAgent;
    inputAgents: LlmAgent[];
}