import api from '../api';
import { DataSource } from '../models/DataSource';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import { ErrorResponse } from '../types/ErrorResponse';
import { Tag } from '../models/Tag';
import { UserDataSource } from '../models/UserDataSource';

const userDataSourceService = {
  getAll: async (keycloakSubject: string | undefined): Promise<StrapiServiceResponse<UserDataSource[]>> => {
    const currentDate = new Date().toISOString();
    try {
      if (!keycloakSubject) {
        const result: StrapiServiceResponse<UserDataSource[]> = {
          data: null,
          error: {
            status: 400,
            statusText: 'Bad Request',
            data: { message: 'subject is undefined' },
          },
        };
        return result;
      }
      const response = await api.get(`/user-data-sources?populate[0]=task&filters[userProfile][keycloaksubject][$eq]=${keycloakSubject}`);
     
      const result: StrapiServiceResponse<UserDataSource[]> = { data: response.data.data, error: null };
      return result;
    } catch (error) {
      const result: StrapiServiceResponse<UserDataSource[]> = { data: null, error: error as ErrorResponse };
      return result;
    }
  },
};

export default userDataSourceService;
