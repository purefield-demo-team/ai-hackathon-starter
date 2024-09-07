import { UserProfile } from './UserProfile';
import { Tag } from './Tag';

export type GoalStatus = 'not started' | 'in progress' | 'completed';

export interface Goal {
  id?: number;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status: GoalStatus;
  userProfile?: UserProfile;
  tags: Tag[];
}
