// src/services/goalTaskService.ts

import api from '../api';
import { Goal } from '../models/Goal';
import { Task } from '../models/Task';
import { GoalTask } from '../models/GoalTask';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';

const goalTaskService = {
  getByGoalId: async (id: number | undefined, showCompleted: boolean): Promise<StrapiServiceResponse<GoalTask[]>> => {
    try {
      const currentDate = new Date().toISOString();
      const completedFilter = showCompleted ? '' : `&filters[status][$ne]=completed`;
      const sortOrder = `&sort[0]=task.status%3Aasc&sort[1]=task.dueDate%3C${encodeURIComponent(currentDate)}%3Adesc&sort[2]=task.dueDate%3Aasc`;
      if (!id) {
        const result: StrapiServiceResponse<GoalTask[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/goal-tasks?populate[0]=task&populate[1]=goal&filters[goal][id][$eq]=${id}${completedFilter}${sortOrder}`);
      const result: StrapiServiceResponse<GoalTask[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GoalTask[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByTaskId: async (id: string | undefined): Promise<StrapiServiceResponse<GoalTask[]>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<GoalTask[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/goal-tasks?populate[0]=task&populate[1]=goal&filters[task][id][$eq]=${id}`);
      const result: StrapiServiceResponse<GoalTask[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GoalTask[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByGoalIdAndTaskId: async (goalid: string | undefined, taskid: string | undefined): Promise<StrapiServiceResponse<GoalTask>> => {
    try {

      if (!goalid || !taskid) {
        const result: StrapiServiceResponse<GoalTask> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID or Task ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/goal-tasks?populate[0]=task&populate[1]=goal&filters[goal][id][$eq]=${goalid}&filters[task][id][$eq]=${taskid}`);
      const result: StrapiServiceResponse<GoalTask> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GoalTask> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  create: async (goalTask: GoalTask): Promise<StrapiServiceResponse<GoalTask>> => {
    try {
      const response = await api.post('/goal-tasks', { data: goalTask });
      const result: StrapiServiceResponse<GoalTask> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GoalTask> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  delete: async (id: number | undefined): Promise<StrapiServiceResponse<boolean>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<boolean> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      await api.delete(`/goal-tasks/${id}`);
      const result: StrapiServiceResponse<boolean> = { data: true, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = { data: false, error: error as ErrorResponse };
      return result;
    }
  },
};

export default goalTaskService;
