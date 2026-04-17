/**
 * Optimized React Query Hook for Hypergrowth
 * Prevents N+1, implements memoization, virtual scrolling support
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';

/**
 * Memoized query with built-in caching
 */
export function useOptimizedQuery(queryKey, queryFn, options = {}) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 30 * 60 * 1000, // 30 minutes (was cacheTime)
    retry = 2,
    retryDelay = attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled = true,
  } = options;

  return useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    retry,
    retryDelay,
    enabled,
  });
}

/**
 * Paginated query hook with built-in optimization
 */
export function usePaginatedQuery(queryKey, queryFn, pageSize = 50) {
  const [currentPage, setCurrentPage] = React.useState(0);

  const { data, isLoading, error } = useOptimizedQuery(
    [...queryKey, currentPage],
    () => queryFn(currentPage, pageSize),
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  return {
    data,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    pageSize,
    hasMore: data?.length === pageSize,
  };
}

/**
 * Infinite query with virtualization support
 * Prevents loading all items at once
 */
export function useVirtualizedList(queryKey, queryFn, options = {}) {
  const { pageSize = 50, estimatedItemHeight = 80 } = options;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => queryFn(pageParam, pageSize),
    getNextPageParam: (lastPage) => (lastPage.length === pageSize ? lastPage.length : undefined),
  });

  const items = useMemo(() => {
    return data?.pages.flatMap(page => page) || [];
  }, [data]);

  return {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    estimatedItemHeight,
  };
}

/**
 * Debounced search query
 */
export function useDebouncedSearch(searchTerm, queryFn, delay = 300) {
  const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return useOptimizedQuery(['search', debouncedTerm], () => queryFn(debouncedTerm), {
    enabled: debouncedTerm.length > 2,
  });
}

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';