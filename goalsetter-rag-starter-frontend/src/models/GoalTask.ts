import { Goal } from './Goal';
import { Task } from './Task';

export interface GoalTask {
  id?: number;
  goal: Goal;
  task: Task;
}
