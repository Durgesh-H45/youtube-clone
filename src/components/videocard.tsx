import { Card, CardMedia, CardContent, Typography, Avatar, Box } from '@mui/material';
import type { Video } from '../types/video';


interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardMedia
        component="img"
        image={video.thumbnail}
        sx={{ borderRadius: 2, height: 160, objectFit: 'cover' }}
      />
      <CardContent sx={{ display: 'flex', gap: 1, px: 0 }}>
        <Avatar sx={{ width: 36, height: 36 }} />
        <Box>
          <Typography variant="body2" color="textSecondary">
            {video.channelTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {video.channelTitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}