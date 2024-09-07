// src/hooks/useFetchData.ts
import { useEffect, useState } from 'react';
import { ErrorResponse } from '../types/ErrorResponse';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';

type FetchFunction<T, A extends any[]> = (...args: A) => Promise<StrapiServiceResponse<T | T[]>>;

export function useFetchData<T, A extends any[]>(
  fetchFunction: FetchFunction<T, A>,
  ...fetchArgs: A
) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey(refreshKey + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchFunction(...fetchArgs);
        setData(Array.isArray(response.data) ? response.data : ([response.data] as T[]));
        setError(null);
      } catch (error) {
        setError(error as ErrorResponse);
        setData(null);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [fetchFunction, ...fetchArgs, refreshKey]);

  return { data, error, isLoading, refresh };
}
