import api from '../api';
import { DataSource } from '../models/DataSource';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';
import { Tag } from '../models/Tag';

const dataSourceService = {
  
  get: async (id: string | undefined): Promise<StrapiServiceResponse<DataSource>> => {
    try {

      if (!id) {
        const result: StrapiServiceResponse<DataSource> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'Task ID is undefined' },
          },
        };
        return result;
      }

      const response = await api.get(`/data-sources/${id}`);
      const result: StrapiServiceResponse<DataSource> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<DataSource> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
  getByIds: async (ids: [], showCompleted: boolean): Promise<StrapiServiceResponse<DataSource[]>> => {
    const currentDate = new Date().toISOString();
    const sortOrder = `&sort[0]=name`;
    try {
      if (!ids) {
        const result: StrapiServiceResponse<DataSource[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'tags undefined' },
          },
        };
        return result;
      }
  
      const idFilters = ids
        .map((id) => `filters[id][$in]=${id}`)
        .join('&');
  
      const response = await api.get(`/data-sources?${idFilters}${sortOrder}`);
      const result: StrapiServiceResponse<DataSource[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<DataSource[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  }, 
};

export default dataSourceService;
