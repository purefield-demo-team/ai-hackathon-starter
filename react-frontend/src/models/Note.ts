import { UserProfile } from './UserProfile';
import { Tag } from './Tag';

export interface Note {
  id?: number;
  name: string;
  richText: string;
  recordedAt?: string;
  userProfile?: UserProfile;
  tags: Tag[];
}
