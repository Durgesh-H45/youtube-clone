import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { getVideos } from '../api/youtube';
import type { Video } from '../types/video';
import VideoCardDetailed from './VideoCardDetailed';

export default function VideoGrid() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    getVideos('react hooks').then(setVideos);
  }, []);

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {videos.map((video) => (
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={video.id}>
          <VideoCardDetailed video={video} />
        </Grid>
      ))}
    </Grid>
  );
}