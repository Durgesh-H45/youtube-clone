import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Avatar, Typography, Grid, CircularProgress, Divider, Button } from '@mui/material';
import { getChannelDetails, getChannelVideos } from '../api/youtube';
import type { Channel, Video } from '../types/video';
import VideoCardDetailed from './VideoCardDetailed';

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [channelLoading, setChannelLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [videosLoading, setVideosLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!channelId) return;
    setChannel(null);
    setChannelLoading(true);
    setVideos([]);
    setNextPageToken(null);
    getChannelDetails(channelId)
      .then(setChannel)
      .finally(() => setChannelLoading(false));
  }, [channelId]);

  const loadMore = useCallback(async () => {
    if (videosLoading || !channelId) return;
    setVideosLoading(true);
    const result = await getChannelVideos(channelId, nextPageToken || '');
    setVideos((prev) => [...prev, ...result.videos]);
    setNextPageToken(result.nextPageToken);
    setVideosLoading(false);
  }, [channelId, nextPageToken, videosLoading]);

  useEffect(() => {
    if (channelId) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  useEffect(() => {
    if (!sentinelRef.current || !nextPageToken) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextPageToken, loadMore]);

  if (channelLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!channel) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">Channel not found.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          width: '100%',
          height: { xs: 120, sm: 180, md: 220 },
          bgcolor: 'grey.200',
          backgroundImage: channel.banner ? `url(${channel.banner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 4, py: 3, flexWrap: 'wrap' }}>
        <Avatar src={channel.avatar} sx={{ width: 120, height: 120 }} />

        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Typography variant="h4" sx={{ fontWeight: 500 }}>
            {channel.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {channel.handle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            More about this channel{' '}
            <Box component="span" sx={{ fontWeight: 500, color: 'text.primary', cursor: 'pointer' }}>
              ...more
            </Box>
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Button
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: 5,
                borderColor: 'rgba(0,0,0,0.2)',
                color: 'text.primary',
              }}
            >
              Customise channel
            </Button>
            <Button
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: 5,
                borderColor: 'rgba(0,0,0,0.2)',
                color: 'text.primary',
              }}
            >
              Manage videos
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {videos.map((video) => (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={video.id}>
              <VideoCardDetailed video={video} />
            </Grid>
          ))}
        </Grid>

        <Box ref={sentinelRef} sx={{ height: 1 }} />

        {videosLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        )}
      </Box>
    </Box>
  );
}