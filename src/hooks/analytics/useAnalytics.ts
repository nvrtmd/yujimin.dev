'use client';

import { useState, useEffect, useCallback } from 'react';
import { parseWithZod, SchemaParseError } from '@/libs/parseWithZod';
import { ANALYTICS_CACHE_KEY, API_ENDPOINT } from './trackVisit';
import { Analytics, analyticsResponseSchema } from '@/models';

const CACHE_DURATION = 1 * 60 * 1000;
const ERROR_MESSAGE_FETCH = 'Failed to load analytics data.';
const ERROR_PREFIX_API = 'API Error (fetchMetrics):';
const ERROR_PREFIX_VALIDATION = 'Data validation failed (fetchAnalytics):';
const ERROR_PREFIX_FETCH = 'Failed to fetch analytics:';
const ERROR_PREFIX_CACHE = 'Cache parse error:';

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    const cached = localStorage.getItem(ANALYTICS_CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setMetrics(data);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error(ERROR_PREFIX_CACHE, error);
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT);
      const result = await response.json();
      const parsedData = parseWithZod(result, analyticsResponseSchema);

      if (parsedData.success) {
        setMetrics(parsedData.data);
        localStorage.setItem(
          ANALYTICS_CACHE_KEY,
          JSON.stringify({ data: parsedData.data, timestamp: Date.now() }),
        );
      } else {
        console.error(ERROR_PREFIX_API, parsedData.error);
      }
    } catch (error) {
      if (error instanceof SchemaParseError) {
        console.error(ERROR_PREFIX_VALIDATION, error.originalError.issues);
        setError(error.originalError.message);
      } else {
        console.error(ERROR_PREFIX_FETCH, error);
        setError((error as Error).message || ERROR_MESSAGE_FETCH);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { metrics, isLoading, error };
};
