import api from '../api';
import { Milestone } from '../models/Milestone';

const milestoneService = {
  getAll: async (goalId: number) => {
    const response = await api.get(`/goals/${goalId}/milestones`);
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/milestones/${id}`);
    return response.data;
  },
  create: async (milestone: Milestone) => {
    const response = await api.post('/milestones', milestone);
    return response.data;
  },
  update: async (id: number, milestone: Milestone) => {
    const response = await api.put(`/milestones/${id}`, milestone);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/milestones/${id}`);
  },
};

export default milestoneService;
