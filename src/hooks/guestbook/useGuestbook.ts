'use client';

import { useState } from 'react';
import { GuestbookEntry } from '@/models';
import { ENTRIES_PER_PAGE } from '@/models/constants';
import { parseWithZod, SchemaParseError } from '@/libs/parseWithZod';
import { guestbookListResponseSchema } from '@/models';

const FIRST_PAGE = 1;

const ERROR_API_FAILED = 'API Error (fetchEntries):';
const ERROR_VALIDATION_FAILED = 'Data validation failed (fetchEntries):';
const ERROR_FETCH_FAILED = 'Failed to fetch entries:';

function getNextPageCount(itemCount: number, pageSize = ENTRIES_PER_PAGE) {
  return Math.max(0, Math.ceil(itemCount / pageSize)) + 1;
}

export const useGuestbook = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchEntries = async (pageOverride?: number) => {
    if (isLoading) return;
    if (pageOverride === undefined && !hasNextPage) return;

    setIsLoading(true);
    try {
      const page = pageOverride ?? getNextPageCount(entries.length);

      const response = await fetch(
        `/api/guestbook?page=${page}&limit=${ENTRIES_PER_PAGE}`,
      );
      const data = await response.json();
      const parsedData = parseWithZod(data, guestbookListResponseSchema);

      if (parsedData.success) {
        if (page === FIRST_PAGE) {
          setEntries(parsedData.data.entries);
        } else {
          setEntries((prev) => [...prev, ...parsedData.data.entries]);
        }

        setHasNextPage(parsedData.data.entries.length === ENTRIES_PER_PAGE);
      } else {
        console.error(ERROR_API_FAILED, parsedData.error);
        setHasNextPage(false);
      }
    } catch (error) {
      setHasNextPage(false);
      if (error instanceof SchemaParseError) {
        console.error(ERROR_VALIDATION_FAILED, error.originalError.issues);
      } else {
        console.error(ERROR_FETCH_FAILED, error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEntries = async () => {
    setEntries([]);
    setHasNextPage(true);
    await fetchEntries(FIRST_PAGE);
  };

  return {
    entries,
    isLoading,
    hasNextPage,
    fetchEntries,
    refreshEntries,
  };
};
