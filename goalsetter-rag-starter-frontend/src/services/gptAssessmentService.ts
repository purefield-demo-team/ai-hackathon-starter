// src/services/goalService.ts

import api from '../api';
import { Goal } from '../models/Goal';
import { GPTAssessment } from '../models/GPTAssessment';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';
import { Tag } from '../models/Tag';

const gptAssessmentService = {
  getAll: async (keycloakSubjectAndGoalFilter: string | undefined): Promise<StrapiServiceResponse<GPTAssessment[]>> => {
    try {
      if (!keycloakSubjectAndGoalFilter) {
        const result: StrapiServiceResponse<GPTAssessment[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Subject is undefined' },
          },
        };
        return result;
      }
      const response = await api.get(`/gpt-assessments?filters[userProfile][keycloaksubject][$eq]=${keycloakSubjectAndGoalFilter}&pagination[page]=1&pagination[pageSize]=15&sort[0]=createdAt%3Adesc`);
      const result: StrapiServiceResponse<GPTAssessment[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GPTAssessment[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  get: async (id: string | undefined): Promise<StrapiServiceResponse<GPTAssessment>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<GPTAssessment> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/gpt-assessments/${id}`);
      const result: StrapiServiceResponse<GPTAssessment> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GPTAssessment> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  create: async (gptAssessment: GPTAssessment): Promise<StrapiServiceResponse<GPTAssessment>> => {
    try {
      const response = await api.post('/gpt-assessments', { data: gptAssessment });
      const result: StrapiServiceResponse<GPTAssessment> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GPTAssessment> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  update: async (id: string | undefined, gptAssessment: Partial<GPTAssessment>): Promise<StrapiServiceResponse<GPTAssessment>> => {
  
    try {

      if (!id) {
        const result: StrapiServiceResponse<GPTAssessment> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.put(`/gpt-assessments/${id}`, { data: gptAssessment });
      const result: StrapiServiceResponse<GPTAssessment> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GPTAssessment> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByTagsAndGoalId: async (tags: Tag[], goalId?: string): Promise<StrapiServiceResponse<GPTAssessment[]>> => {
    const goalFilter = goalId ? `&filters[goal][id][$eq]=${goalId}` : '';

    try {
      if (!tags) {
        const result: StrapiServiceResponse<GPTAssessment[]> = {
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
  
      const response = await api.get(`/gpt-assessments?${tagFilters}${goalFilter}&sort[0]=createdAt%3Aasc`);
      const result: StrapiServiceResponse<GPTAssessment[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<GPTAssessment[]> = { data: null, error: error as ErrorResponse };
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
            data: { message: 'Goal ID is undefined' },
          },
        };
        return result;
      }

      await api.delete(`/gpt-assessments/${id}`);
      const result: StrapiServiceResponse<boolean> = { data: true, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = { data: false, error: error as ErrorResponse };
      return result;
    }
  },
};

export default gptAssessmentService;
