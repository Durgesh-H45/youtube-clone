import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

import {
  getVideos,
  type VideoSearchOptions,
} from '../api/youtube';

import type { Video } from '../types/video';

import SearchVideoCard from './SearchVideoCard';

type FilterType =
  | 'all'
  | 'videos'
  | 'shorts'
  | 'live'
  | 'recent';

interface Filter {
  label: string;
  value: FilterType;
}

const filters: Filter[] = [
  { label: 'All', value: 'all' },
  { label: 'Shorts', value: 'shorts' },
  { label: 'Videos', value: 'videos' },
  { label: 'Recently uploaded', value: 'recent' },
  { label: 'Live', value: 'live' },
];

function getFilterOptions(
  filter: FilterType
): VideoSearchOptions {
  switch (filter) {
    case 'shorts':
      return {
        videoDuration: 'short',
      };

    case 'live':
      return {
        eventType: 'live',
      };

    case 'recent': {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      return {
        publishedAfter: date.toISOString(),
      };
    }

    case 'videos':
    case 'all':
    default:
      return {};
  }
}

export default function SearchPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const query =
    searchParams.get('search_query') || '';

  const [videos, setVideos] = useState<Video[]>([]);

  const [nextPageToken, setNextPageToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<FilterType>(
      (searchParams.get('filter') as FilterType) || 'all'
    );

  const sentinelRef =
    useRef<HTMLDivElement | null>(null);

  // Load the first page
  const loadFirstPage = useCallback(async () => {
    if (!query.trim()) {
      setVideos([]);
      setNextPageToken(null);
      return;
    }

    setLoading(true);
    setError('');

    setVideos([]);
    setNextPageToken(null);

    try {
      const result = await getVideos(
        query,
        '',
        getFilterOptions(activeFilter)
      );

      setVideos(result.items);

      setNextPageToken(result.nextPageToken);
    } catch (err) {
      console.error(err);

      setError(
        'Failed to load search results.'
      );
    } finally {
      setLoading(false);
    }
  }, [query, activeFilter]);

  // Reload when query or filter changes
  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // Load more videos
  const loadMore = useCallback(async () => {
    if (
      loading ||
      !nextPageToken ||
      !query.trim()
    ) {
      return;
    }

    setLoading(true);

    try {
      const result = await getVideos(
        query,
        nextPageToken,
        getFilterOptions(activeFilter)
      );

      setVideos((previousVideos) => [
        ...previousVideos,
        ...result.items,
      ]);

      setNextPageToken(result.nextPageToken);
    } catch (err) {
      console.error(err);

      setError(
        'Failed to load more search results.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    query,
    nextPageToken,
    activeFilter,
    loading,
  ]);

  // Infinite scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !nextPageToken) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting
          ) {
            loadMore();
          }
        },
        {
          rootMargin: '400px',
        }
      );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, nextPageToken]);

  // Change filter
  const handleFilterChange = (
    filter: FilterType
  ) => {
    setActiveFilter(filter);

    const newParams =
      new URLSearchParams(searchParams);

    newParams.set('filter', filter);

    setSearchParams(newParams);
  };

  return (
    <Box
      sx={{
        px: {
          xs: 1,
          sm: 3,
          md: 5,
        },
        py: 2,
        maxWidth: 1100,
        mx: 'auto',
      }}
    >
      {/* Search heading */}
      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 500,
          mb: 2,
        }}
      >
        Search results for "{query}"
      </Typography>

      {/* Filter buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 2,
          mb: 2,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {filters.map((filter) => (
          <Button
            key={filter.value}
            onClick={() =>
              handleFilterChange(
                filter.value
              )
            }
            variant={
              activeFilter === filter.value
                ? 'contained'
                : 'outlined'
            }
            sx={{
              whiteSpace: 'nowrap',
              textTransform: 'none',
              borderRadius: 2,
              color:
                activeFilter === filter.value
                  ? '#fff'
                  : 'text.primary',
              bgcolor:
                activeFilter === filter.value
                  ? '#0f0f0f'
                  : 'transparent',
              borderColor:
                'rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor:
                  activeFilter === filter.value
                    ? '#272727'
                    : '#f2f2f2',
              },
            }}
          >
            {filter.label}
          </Button>
        ))}
      </Box>

      {/* Error message */}
      {error && (
        <Typography
          color="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Typography>
      )}

      {/* Search results */}
      <Box>
        {videos.map((video) => (
          <SearchVideoCard
            key={video.id}
            video={video}
          />
        ))}
      </Box>

      {/* No results message */}
      {!loading &&
        !error &&
        videos.length === 0 && (
          <Typography
            sx={{
              textAlign: 'center',
              py: 5,
              color: 'text.secondary',
            }}
          >
            {query.trim()
              ? 'No videos found.'
              : 'Enter a search query.'}
          </Typography>
        )}

      {/* Infinite scroll sentinel */}
      <Box
        ref={sentinelRef}
        sx={{
          height: 1,
        }}
      />

      {/* Loading indicator */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 3,
          }}
        >
          <CircularProgress
            size={28}
          />
        </Box>
      )}
    </Box>
  );
}