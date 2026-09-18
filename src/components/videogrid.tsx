import { useCallback, useEffect, useRef, useState } from 'react';
import { Grid, Box, CircularProgress } from '@mui/material';
import { getVideos } from '../api/youtube';
import type { Video } from '../types/video';
import VideoCardDetailed from './VideoCardDetailed';

export default function VideoGrid() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const result = await getVideos('react hooks', nextPageToken || '');
    setVideos((prev) => [...prev, ...result.videos]);
    setNextPageToken(result.nextPageToken);
    setLoading(false);
  }, [nextPageToken, loading]);

  // Load the very first page on mount
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load more when the sentinel scrolls into view
  useEffect(() => {
    if (!sentinelRef.current || !nextPageToken) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextPageToken, loadMore]);

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {videos.map((video) => (
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={video.id}>
            <VideoCardDetailed video={video} />
          </Grid>
        ))}
      </Grid>

      <Box ref={sentinelRef} sx={{ height: 1 }} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}
    </Box>
  );
}