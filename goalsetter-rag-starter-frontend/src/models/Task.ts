// Task.ts
import { UserProfile } from './UserProfile';
import { Tag } from './Tag';
export type TaskStatus = 'not started' | 'in progress' | 'completed';

export interface Task {
  id?: number;
  title: string;
  description: string;
  startDate?: string;
  closeDate?: string;
  dueDate?: string;
  status: TaskStatus;
  userProfile?: UserProfile;
  tags: Tag[];
}
