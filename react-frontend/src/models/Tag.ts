// Tag.ts
import { UserProfile } from './UserProfile';

export interface Tag {
    id?: number;
    name: string;
    description?: string;
    userProfile?: UserProfile;
    dashboard?: boolean;
  }
  