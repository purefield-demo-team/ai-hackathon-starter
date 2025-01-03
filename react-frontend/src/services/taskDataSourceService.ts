import api from '../api';
import { DataSource } from '../models/DataSource';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';
import { Tag } from '../models/Tag';
import { TaskDataSource } from '../models/TaskDataSource';

const taskDataSourceService = {
  getAll: async (keycloakSubject: string | undefined): Promise<StrapiServiceResponse<TaskDataSource[]>> => {
    const currentDate = new Date().toISOString();
    try {
      if (!keycloakSubject) {
        const result: StrapiServiceResponse<TaskDataSource[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'subject is undefined' },
          },
        };
        return result;
      }
      const response = await api.get(`/task-data-sources?filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}`);
     
      const result: StrapiServiceResponse<TaskDataSource[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<TaskDataSource[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByTaskId: async (id: string | undefined): Promise<StrapiServiceResponse<TaskDataSource[]>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<TaskDataSource[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Task ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/task-data-sources/?populate[0]=dataSource&populate[1]=task$filters[task][id][$eq]=${id}`);
      const result: StrapiServiceResponse<TaskDataSource[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<TaskDataSource[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  create: async (taskDataSource: TaskDataSource): Promise<StrapiServiceResponse<TaskDataSource>> => {
    try {
      const response = await api.post('/task-data-sources?populate[0]=task&populate[1]=dataSource', { data: taskDataSource });
      const result: StrapiServiceResponse<TaskDataSource> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<TaskDataSource> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  delete: async (id: number | undefined): Promise<StrapiServiceResponse<TaskDataSource>> => {
    try {
      await api.delete(`/task-data-sources/${id}`);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as ErrorResponse };
    }
  },
};

export default taskDataSourceService;
