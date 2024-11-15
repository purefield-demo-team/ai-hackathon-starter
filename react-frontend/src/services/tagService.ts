import api from '../api';
import { Task } from '../models/Task';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { Tag } from '../models/Tag';
import { ErrorResponse } from '../types/ErrorResponse';

const tagService = {
  getAll: async (keycloakSubject: string | undefined): Promise<StrapiServiceResponse<Tag[]>> => {
    try {
      console.log("about to get tags in getAll")
      if (!keycloakSubject) {
        const result: StrapiServiceResponse<Tag[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'subject is undefined' },
          },
        };
        return result;
      }
      const response = await api.get(`/tags?filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}`);
      //const response = await api.get(`/tasks`);
      const result: StrapiServiceResponse<Tag[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Tag[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  findByName: async (keycloakSubject: string | undefined, name: string | undefined): Promise<StrapiServiceResponse<Tag[]>> => {
    try {
      console.log("about to get tags in findByName")
      if (!keycloakSubject || !name) {
        const result: StrapiServiceResponse<Tag[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'subject or name is undefined' },
          },
        };
        return result;
      }
      const response = await api.get(`/tags?filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}&filters[name][$containsi]=${name}`);
      //const response = await api.get(`/tasks`);
      const result: StrapiServiceResponse<Tag[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Tag[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  findByDashboardStatus: async (keycloakSubject: string | undefined, dashboard: boolean | undefined): Promise<StrapiServiceResponse<Tag[]>> => {
    try {
      if (!keycloakSubject || dashboard === undefined) {
        const result: StrapiServiceResponse<Tag[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'subject or dashboard status is undefined' },
          },
        };
        return result;
      }

      var filters = `filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}&filters[$or][0][dashboard][$eq]=${dashboard}&filters[$or][1][dashboard][$null]=true`;
      if(dashboard) {
        filters = `filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}&filters[dashboard][$eq]=${dashboard}`;
      }

      const response = await api.get('/tags?' + filters);
      const result: StrapiServiceResponse<Tag[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Tag[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },  
  get: async (id: string | undefined): Promise<StrapiServiceResponse<Tag>> => {
    try {
      console.log("about to get tags in get")
      if (!id) {
        const result: StrapiServiceResponse<Tag> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Tag ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/tags/${id}`);
      const result: StrapiServiceResponse<Tag> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Tag> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  create: async (tag: Tag): Promise<StrapiServiceResponse<Tag>> => {
    try {
      const response = await api.post('/tags', { data: tag });
      const result: StrapiServiceResponse<Tag> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Tag> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  update: async (id: string | undefined, tag: Tag): Promise<StrapiServiceResponse<Tag>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<Tag> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Tag ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.put(`/tags/${id}`, { data: tag });
      const result: StrapiServiceResponse<Tag> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Tag> = { data: null, error: error as ErrorResponse };
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
            data: { message: 'Tag ID is undefined' },
          },
        };
        return result;
      }

      await api.delete(`/tags/${id}`);
      const result: StrapiServiceResponse<boolean> = { data: true, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = { data: false, error: error as ErrorResponse };
      return result;
    }
  },
};

export default tagService;
