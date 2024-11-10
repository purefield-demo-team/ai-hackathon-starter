// src/services/agentRouterService.ts

import api from '../api';
import { AgentRouter } from '../models/AgentRouter';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';

const agentRouterService = {
  getAll: async (): Promise<StrapiServiceResponse<AgentRouter[]>> => {
    try {
      const response = await api.get('/agent-routers');
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error as ErrorResponse };
    }
  },

  get: async (id: string | undefined): Promise<StrapiServiceResponse<AgentRouter>> => {
    try {
      if (!id) {
        return {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'AgentRouter ID is undefined' },
          },
        };
      }

      const response = await api.get(`/agent-routers/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error as ErrorResponse };
    }
  },

  create: async (router: AgentRouter): Promise<StrapiServiceResponse<AgentRouter>> => {
    try {
      const response = await api.post('/agent-routers', { data: router });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error as ErrorResponse };
    }
  },

  update: async (
    id: string | undefined,
    router: AgentRouter
  ): Promise<StrapiServiceResponse<AgentRouter>> => {
    try {
      if (!id) {
        return {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'AgentRouter ID is undefined' },
          },
        };
      }

      const response = await api.put(`/agent-routers/${id}`, { data: router });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error as ErrorResponse };
    }
  },

  delete: async (id: string | undefined): Promise<StrapiServiceResponse<boolean>> => {
    try {
      if (!id) {
        return {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'AgentRouter ID is undefined' },
          },
        };
      }

      await api.delete(`/agent-routers/${id}`);
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: error as ErrorResponse };
    }
  },
};

export default agentRouterService;