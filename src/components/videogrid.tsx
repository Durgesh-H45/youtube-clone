import { useCallback, useEffect, useRef, useState } from 'react';
import { Grid, Box, CircularProgress, Typography } from '@mui/material';

import { getVideos } from '../api/youtube';
import type { Video } from '../types/video';
import VideoCardDetailed from './VideoCardDetailed';

interface VideoGridProps {
  query: string;
}

export default function VideoGrid({ query }: VideoGridProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Prevent IntersectionObserver from triggering multiple requests
  // before the previous request finishes.
  const loadingRef = useRef(false);

  // Helps prevent an old search request from updating the new search.
  const requestIdRef = useRef(0);

  /**
   * Load the first page whenever the search query changes.
   */
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    setVideos([]);
    setNextPageToken(null);

    if (!query.trim()) {
      setLoading(false);
      loadingRef.current = false;
      return;
    }

    const loadFirstPage = async () => {
      loadingRef.current = true;
      setLoading(true);

      try {
        const result = await getVideos(query.trim());

        // Ignore result if user searched something else meanwhile.
        if (requestId !== requestIdRef.current) return;

        setVideos(result.items);
        setNextPageToken(result.nextPageToken);
      } catch (error) {
        if (requestId === requestIdRef.current) {
          console.error('Failed to load videos:', error);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    };

    loadFirstPage();
  }, [query]);

  /**
   * Load the next page.
   */
  const loadMore = useCallback(async () => {
    // Don't request if:
    // - already loading
    // - no next page
    // - empty query
    if (
      loadingRef.current ||
      !nextPageToken ||
      !query.trim()
    ) {
      return;
    }

    const requestId = requestIdRef.current;

    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await getVideos(
        query.trim(),
        nextPageToken
      );

      // Ignore stale response.
      if (requestId !== requestIdRef.current) return;

      setVideos((prev) => {
        // Prevent duplicate videos just in case.
        const existingIds = new Set(prev.map((video) => video.id));

        const newVideos = result.items.filter(
          (video) => !existingIds.has(video.id)
        );

        return [...prev, ...newVideos];
      });

      setNextPageToken(result.nextPageToken);
    } catch (error) {
      console.error('Failed to load more videos:', error);
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [query, nextPageToken]);

  /**
   * Watch the invisible element at the bottom of the grid.
   *
   * When it gets close to the viewport, load the next page.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !nextPageToken) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      {
        // Start loading before the user reaches the bottom.
        rootMargin: '600px',
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, nextPageToken]);

  return (
    <Box sx={{ p: 2 }}>
      {videos.length > 0 && (
        <Grid container spacing={2}>
          {videos.map((video) => (
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 6,
                lg: 4,
              }}
              key={video.id}
            >
              <VideoCardDetailed video={video} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Infinite-scroll trigger */}
      <Box
        ref={sentinelRef}
        sx={{
          height: 20,
          width: '100%',
        }}
      />

      {/* Loading spinner */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}

      {/* No results */}
      {!loading && query.trim() && videos.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 6,
          }}
        >
          <Typography color="text.secondary">
            No videos found.
          </Typography>
        </Box>
      )}

      {/* End of results */}
      {!loading && videos.length > 0 && !nextPageToken && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Typography color="text.secondary">
            You've reached the end.
          </Typography>
        </Box>
      )}
    </Box>
  );
}