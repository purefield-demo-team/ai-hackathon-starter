// src/services/goalTaskService.ts

import api from '../api';
import { Note } from '../models/Note';
import { Task } from '../models/Task';
import { TaskNote } from '../models/TaskNote';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';

const taskNoteService = {
  getByNoteId: async (id: number | undefined): Promise<StrapiServiceResponse<TaskNote[]>> => {
    try {
      const currentDate = new Date().toISOString();
      
      const sortOrder = `&sort[0]=task.status%3Aasc&sort[1]=task.dueDate%3C${encodeURIComponent(currentDate)}%3Adesc&sort[2]=task.dueDate%3Aasc`;
      if (!id) {
        const result: StrapiServiceResponse<TaskNote[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/task-notes?populate[0]=task&populate[1]=note&filters[note][id][$eq]=${id}${sortOrder}`);
      const result: StrapiServiceResponse<TaskNote[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<TaskNote[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByTaskId: async (id: string | undefined): Promise<StrapiServiceResponse<TaskNote[]>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<TaskNote[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/task-notes?populate[0]=task&populate[1]=note&filters[task][id][$eq]=${id}`);
      const result: StrapiServiceResponse<TaskNote[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<TaskNote[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByNoteIdAndTaskId: async (noteid: string | undefined, taskid: string | undefined): Promise<StrapiServiceResponse<TaskNote>> => {
    try {

      if (!noteid || !taskid) {
        const result: StrapiServiceResponse<TaskNote> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID or Task ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/task-notes?populate[0]=task&populate[1]=note&filters[note][id][$eq]=${noteid}&filters[task][id][$eq]=${taskid}`);
      const result: StrapiServiceResponse<TaskNote> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<TaskNote> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  create: async (taskNote: TaskNote): Promise<StrapiServiceResponse<TaskNote>> => {
    try {
      const response = await api.post('/task-notes?populate=*', { data: taskNote });
      const result: StrapiServiceResponse<TaskNote> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<TaskNote> = { data: null, error: error as ErrorResponse };
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
            data: { message: 'Task ID is undefined' },
          },
        };
        return result;
      }

      await api.delete(`/task-notes/${id}`);
      const result: StrapiServiceResponse<boolean> = { data: true, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = { data: false, error: error as ErrorResponse };
      return result;
    }
  },
};

export default taskNoteService;
