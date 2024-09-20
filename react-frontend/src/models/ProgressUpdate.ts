// ProgressUpdate.ts
export interface ProgressUpdate {
    id?: number;
    taskId: number;
    date: string;
    description: string;
    progress: number;
  }
  