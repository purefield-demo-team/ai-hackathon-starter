import api from '../api';
import { ProgressUpdate } from '../models/ProgressUpdate';

const progressUpdateService = {
  getAll: async (taskId: number) => {
    const response = await api.get(`/tasks/${taskId}/progress-updates`);
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/progress-updates/${id}`);
    return response.data;
  },
  create: async (progressUpdate: ProgressUpdate) => {
    const response = await api.post('/progress-updates', progressUpdate);
    return response.data;
  },
  update: async (id: number, progressUpdate: ProgressUpdate) => {
    const response = await api.put(`/progress-updates/${id}`, progressUpdate);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/progress-updates/${id}`);
  },
};

export default progressUpdateService;
