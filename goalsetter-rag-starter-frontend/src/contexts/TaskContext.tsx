import React, { createContext, useState, useContext } from 'react';
import { Task } from '../models/Task';  // import your Task model

interface TaskContextType {
  selectedTasks: Task[];  // Now it should contain Task[] instead of Task | null
  setSelectedTasks: React.Dispatch<React.SetStateAction<Task[]>>;  // adjust this as well
}

const TaskContext = createContext<TaskContextType | null>(null);

interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);  // rename this to selectedTasks

  return (
    <TaskContext.Provider value={{ selectedTasks, setSelectedTasks }}> 
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === null) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
