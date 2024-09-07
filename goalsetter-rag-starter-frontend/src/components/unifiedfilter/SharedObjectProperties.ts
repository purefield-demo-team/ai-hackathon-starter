import { Tag } from '../../models/Tag';

export interface SharedObjectProperties {
  id?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  recordedAt?: string;
  status?: string; // GoalStatus | TaskStatus;
  tags: Tag[];
}