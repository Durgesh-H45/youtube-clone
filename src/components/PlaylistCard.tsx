
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import type { Playlist } from '../api/youtube';

interface Props {
  playlist: Playlist;
  onClick: () => void;
}

export default function PlaylistCard({ playlist, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      elevation={0}
      sx={{
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <CardMedia
        component="img"
        image={playlist.thumbnail}
        sx={{ aspectRatio: '16/9', objectFit: 'cover' }}
      />
      <CardContent>
        <Typography sx={{fontWeight: 600, 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {playlist.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {playlist.videoCount} videos
        </Typography>
      </CardContent>
    </Card>
  );
}
