// Milestone.ts
export type MilestoneStatus = 'not started' | 'in progress' | 'completed';

export interface Milestone {
  id?: number;
  goalId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: MilestoneStatus;
}
