import internal from 'stream';
import { LlmAgentNode } from './LlmAgentNode';
import { UserProfile } from './UserProfile';
import { DataSource } from './DataSource';

export interface UserDataSource {
    id?: number;
    userProfile: UserProfile;
    dataSource: DataSource;
}