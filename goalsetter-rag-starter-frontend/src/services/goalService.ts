// src/services/goalService.ts

import api from '../api';
import { Goal } from '../models/Goal';
import { Tag } from '../models/Tag';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';

const goalService = {
  getAll: async (keycloakSubject: string | undefined): Promise<StrapiServiceResponse<Goal[]>> => {
    try {
      if (!keycloakSubject) {
        const result: StrapiServiceResponse<Goal[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }
      const response = await api.get(`/goals?filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}`);
      const result: StrapiServiceResponse<Goal[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Goal[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  get: async (id: number | undefined): Promise<StrapiServiceResponse<Goal>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<Goal> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/goals/${id}?populate[0]=tags&populate[1]=userProfile`);
      const result: StrapiServiceResponse<Goal> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Goal> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByTags: async (tags: Tag[]): Promise<StrapiServiceResponse<Goal[]>> => {
    try {
      if (!tags) {
        const result: StrapiServiceResponse<Goal[]> = {
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
  
      const response = await api.get(`/goals?${tagFilters}`);
      const result: StrapiServiceResponse<Goal[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Goal[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },  
  create: async (goal: Goal): Promise<StrapiServiceResponse<Goal>> => {
    try {
      const response = await api.post('/goals', { data: goal });
      const result: StrapiServiceResponse<Goal> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Goal> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  update: async (id: string | undefined, goal: Goal): Promise<StrapiServiceResponse<Goal>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<Goal> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.put(`/goals/${id}`, { data: goal });
      const result: StrapiServiceResponse<Goal> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Goal> = { data: null, error: error as ErrorResponse };
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

      await api.delete(`/goals/${id}`);
      const result: StrapiServiceResponse<boolean> = { data: true, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = { data: false, error: error as ErrorResponse };
      return result;
    }
  },
};

export default goalService;
