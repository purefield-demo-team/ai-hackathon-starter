// src/services/noteService.ts

import api from '../api';
import { Note } from '../models/Note';
import { Tag } from '../models/Tag';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';
import { SystemSecurityUpdate } from '@mui/icons-material';
import taskNoteService from './taskNoteService';

const noteService = {
  getAll: async (keycloakSubject: string | undefined): Promise<StrapiServiceResponse<Note[]>> => {
    try {
      if (!keycloakSubject) {
        const result: StrapiServiceResponse<Note[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Note ID is undefined' },
          },
        };
        return result;
      }
      const response = await api.get(`/notes?filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}`);
      const result: StrapiServiceResponse<Note[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Note[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  get: async (id: string | undefined): Promise<StrapiServiceResponse<Note>> => {
    try {
      
      if (!id) {
        const result: StrapiServiceResponse<Note> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Note ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/notes/${id}?populate[0]=tags&populate[1]=userProfile`);
      const result: StrapiServiceResponse<Note> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Note> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByTags: async (tags: Tag[]): Promise<StrapiServiceResponse<Note[]>> => {
    try {
      if (!tags) {
        const result: StrapiServiceResponse<Note[]> = {
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
  
      const response = await api.get(`/notes?${tagFilters}`);
      const result: StrapiServiceResponse<Note[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Note[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },  
  create: async (note: Note): Promise<StrapiServiceResponse<Note>> => {
    try {
      const response = await api.post('/notes', { data: note });
      const result: StrapiServiceResponse<Note> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Note> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  update: async (id: string | undefined, note: Note): Promise<StrapiServiceResponse<Note>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<Note> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Note ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.put(`/notes/${id}`, { data: note });
      const result: StrapiServiceResponse<Note> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<Note> = { data: null, error: error as ErrorResponse };
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
            data: { message: 'Note ID is undefined' },
          },
        };
        return result;
      }

      await api.delete(`/notes/${id}`);
  
      const result: StrapiServiceResponse<boolean> = { data: true, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<boolean> = { data: false, error: error as ErrorResponse };
      return result;
    }
  },
  uploadImage: async (imageFile: Blob, metadata: Record<string, any> = {}): Promise<StrapiServiceResponse<any>> => {
    try {
      const formData = new FormData();
      formData.append('files', imageFile);
      formData.append('metadata', JSON.stringify(metadata));
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const result: StrapiServiceResponse<any> = { data: response.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<any> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
};

export default noteService;
