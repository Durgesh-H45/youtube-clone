import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Avatar, Button, IconButton, Grid, CircularProgress } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { getVideoById, getVideos } from '../api/youtube';
import type { Video } from '../types/video';
import VideoCardDetailed from './VideoCardDetailed';
import CommentsList from './CommentsList';

export default function VideoPlayerPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);

  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMoreRelated = useCallback(
    async (searchTitle: string, token: string | null) => {
      if (loadingRelated) return;
      setLoadingRelated(true);

      const result = await getVideos(searchTitle, token || '');
      setRelatedVideos((prev) => [
        ...prev,
        ...result.videos.filter((v) => v.id !== videoId),
      ]);
      setNextPageToken(result.nextPageToken);
      setLoadingRelated(false);
    },
    [videoId, loadingRelated]
  );

  // Load the video itself + first page of related videos when videoId changes
  useEffect(() => {
    if (!videoId) return;

    setVideo(null);
    setRelatedVideos([]);
    setNextPageToken(null);

    getVideoById(videoId).then((data) => {
      setVideo(data);
      loadMoreRelated(data.title, null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Infinite scroll: load more related videos as the sentinel comes into view
  useEffect(() => {
    if (!sentinelRef.current || !nextPageToken || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRelated(video.title, nextPageToken);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextPageToken, video, loadMoreRelated]);

  if (!video) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Left: player + info + comments */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ position: 'relative', pt: '56.25%', borderRadius: 2, overflow: 'hidden' }}>
            <Box
              component="iframe"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          </Box>

          <Box sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 2 }}>{video.title}</Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar src={video.channelThumbnail} sx={{ width: 40, height: 40 }} />
              <Box sx={{ fontWeight: 600 }}>{video.channelTitle}</Box>
              <Button variant="contained" sx={{ ml: 2, bgcolor: '#0f0f0f', borderRadius: 5, textTransform: 'none' }}>
                Subscribe
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 5, overflow: 'hidden' }}>
                <IconButton sx={{ borderRadius: 0, px: 2 }}>
                  <ThumbUpOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Box sx={{ fontSize: 14 }}>{video.likes}</Box>
                </IconButton>
                <Box sx={{ width: '1px', bgcolor: 'divider', alignSelf: 'stretch' }} />
                <IconButton sx={{ borderRadius: 0, px: 2 }}>
                  <ThumbDownOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>

              <Button startIcon={<ShareOutlinedIcon />} sx={{ bgcolor: 'grey.100', borderRadius: 5, textTransform: 'none', color: 'text.primary' }}>
                Share
              </Button>
            </Box>
          </Box>

          <Box sx={{ bgcolor: 'grey.100', borderRadius: 2, p: 2, mt: 2 }}>
            <Box sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
              {video.views} • {video.postedAt}
            </Box>
            <Box sx={{ fontSize: 14, whiteSpace: 'pre-line' }}>{video.description}</Box>
          </Box>

          <CommentsList videoId={video.id} />
        </Grid>

        {/* Right: related videos, with its own infinite scroll */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {relatedVideos.map((v) => (
              <VideoCardDetailed key={v.id} video={v} />
            ))}

            <Box ref={sentinelRef} sx={{ height: 1 }} />

            {loadingRelated && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}