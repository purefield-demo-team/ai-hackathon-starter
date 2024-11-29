import internal from 'stream';
import { LlmAgentNode } from './LlmAgentNode';
import { Media } from './media/Media';

export interface DataSource {
    id?: number;
    name: string;
    description: string;
    username: string;
    password: string;
    host: string;
    tlsRejectUnauthorized: number;
    ssl: boolean;
    schema: string;
    image: Media;
}