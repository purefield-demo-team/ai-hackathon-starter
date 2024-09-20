import { Note } from './Note';
import { Task } from './Task';

export interface TaskNote {
  id?: number;
  note: Note;
  task: Task;
}
