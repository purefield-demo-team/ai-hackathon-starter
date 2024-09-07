import api from '../api';
import { Task } from '../models/Task';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';
import { Tag } from '../models/Tag';

const taskService = {
  
  getAll: async (keycloakSubject: string | undefined, showCompleted: boolean): Promise<StrapiServiceResponse<Task[]>> => {
    const currentDate = new Date().toISOString();
    const sortOrder = `&sort[0]=status%3Aasc&sort[1]=dueDate%3Adesc&sort[2]=dueDate%3Aasc`;
    const completedFilter = showCompleted ? '' : `&filters[status][$ne]=completed`;
    try {
      if (!keycloakSubject) {
        const result: StrapiServiceResponse<Task[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'subject is undefined' },
          },
        };
        return result;
      }
      const response = await api.get(`/tasks?filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}${completedFilter}${sortOrder}`);
      //const response = await api.get(`/tasks`);
      const result: StrapiServiceResponse<Task[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Task[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  get: async (id: string | undefined): Promise<StrapiServiceResponse<Task>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<Task> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Task ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/tasks/${id}?populate[0]=tags&populate[1]=userProfile`);
      const result: StrapiServiceResponse<Task> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Task> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByTags: async (tags: Tag[], showCompleted: boolean): Promise<StrapiServiceResponse<Task[]>> => {
    const currentDate = new Date().toISOString();
    const sortOrder = `&sort[0]=status%3Aasc&sort[1]=dueDate%3Adesc&sort[2]=dueDate%3Aasc`;
    const completedFilter = showCompleted ? '' : `&filters[status][$ne]=completed`;
    try {
      if (!tags) {
        const result: StrapiServiceResponse<Task[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'tags undefined' },
          },
        };
        return result;
      }
  
      const tagFilters = tags
        .map((tag) => `filters[tags][id][$in]=${tag.id}`)
        .join('&');
  
      const response = await api.get(`/tasks?${tagFilters}${completedFilter}${sortOrder}`);
      const result: StrapiServiceResponse<Task[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Task[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  }, 
  create: async (task: Task): Promise<StrapiServiceResponse<Task>> => {
    try {
      const response = await api.post('/tasks', { data: task });
      const result: StrapiServiceResponse<Task> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Task> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  update: async (id: string | undefined, task: Task): Promise<StrapiServiceResponse<Task>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<Task> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Task ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.put(`/tasks/${id}`, { data: task });
      const result: StrapiServiceResponse<Task> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Task> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  delete: async (id: string | undefined): Promise<StrapiServiceResponse<boolean>> => {
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

      await api.delete(`/tasks/${id}`);
      const result: StrapiServiceResponse<boolean> = { data: true, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = { data: false, error: error as ErrorResponse };
      return result;
    }
  },
};

export default taskService;
