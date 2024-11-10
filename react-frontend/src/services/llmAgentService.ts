import api from '../api';
import { LlmAgent } from '../models/LlmAgent';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';

const llmAgentService = {
  getAll: async (): Promise<StrapiServiceResponse<LlmAgent[]>> => {
    try {
      const response = await api.get('/llm-agents');
      const result: StrapiServiceResponse<LlmAgent[]> = {
        data: response.data.data,
        error: null,
      };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<LlmAgent[]> = {
        data: null,
        error: error as ErrorResponse,
      };
      return result;
    }
  },

  get: async (id: string | undefined): Promise<StrapiServiceResponse<LlmAgent>> => {
    try {
      if (!id) {
        const result: StrapiServiceResponse<LlmAgent> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'LlmAgent ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/llm-agents/${id}`);
      const result: StrapiServiceResponse<LlmAgent> = {
        data: response.data.data,
        error: null,
      };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<LlmAgent> = {
        data: null,
        error: error as ErrorResponse,
      };
      return result;
    }
  },

  // In llmAgentService.ts
    getByTags: async (tags: Tag[]): Promise<StrapiServiceResponse<LlmAgent[]>> => {
        try {
        if (!tags || tags.length === 0) {
            return { data: [], error: null };
        }

        const tagFilters = tags.map((tag) => `filters[tags][id][$in]=${tag.id}`).join('&');

        const response = await api.get(`/llm-agents?${tagFilters}`);
        return { data: response.data.data, error: null };
        } catch (error) {
        return { data: null, error: error as ErrorResponse };
        }
    },

  create: async (agent: LlmAgent): Promise<StrapiServiceResponse<LlmAgent>> => {
    try {
      const response = await api.post('/llm-agents', { data: agent });
      const result: StrapiServiceResponse<LlmAgent> = {
        data: response.data.data,
        error: null,
      };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<LlmAgent> = {
        data: null,
        error: error as ErrorResponse,
      };
      return result;
    }
  },

  update: async (
    id: string | undefined,
    agent: LlmAgent
  ): Promise<StrapiServiceResponse<LlmAgent>> => {
    try {
      if (!id) {
        const result: StrapiServiceResponse<LlmAgent> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'LlmAgent ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.put(`/llm-agents/${id}`, { data: agent });
      const result: StrapiServiceResponse<LlmAgent> = {
        data: response.data.data,
        error: null,
      };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<LlmAgent> = {
        data: null,
        error: error as ErrorResponse,
      };
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
            data: { message: 'LlmAgent ID is undefined' },
          },
        };
        return result;
      }

      await api.delete(`/llm-agents/${id}`);
      const result: StrapiServiceResponse<boolean> = {
        data: true,
        error: null,
      };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = {
        data: false,
        error: error as ErrorResponse,
      };
      return result;
    }
  },
};

export default llmAgentService;