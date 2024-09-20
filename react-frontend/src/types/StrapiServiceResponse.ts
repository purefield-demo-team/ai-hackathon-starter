import { ErrorResponse } from './ErrorResponse';

export type StrapiServiceResponse<T> = {
  data: T | null;
  wrappedData?: { data: T };
  error: ErrorResponse | null;
};
