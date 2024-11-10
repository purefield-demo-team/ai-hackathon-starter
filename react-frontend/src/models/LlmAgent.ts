export interface LlmAgent {
    id?: number;
    systemContent: string;
    systemContentMoreInfo: string;
    systemContentType: string;
    description: string;
    name: string;
    systemContentRole: string;
    userContentRole: string;
}