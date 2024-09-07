// src/hooks/useFetchGoals.ts

import { useState, useEffect } from 'react';
import { Goal } from '../models/Goal';
import { StrapiServiceResponse } from '../types/StrapiServiceResponse';
import goalService from '../services/goalService';

export function useFetchGoals(goalId: number | undefined, subject: string | undefined) {
  const [data, setData] = useState<Goal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = goalId
          ? await goalService.get(goalId)
          : { error: null, data: null };
        setData(response.data ? [response.data] : null);
        setError(null);
      } catch (error) {
        setError(error as string);
        setData(null);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [goalId, subject]);

  return { data, error, isLoading };
}
