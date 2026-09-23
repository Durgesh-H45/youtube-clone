
import { Box, CardMedia, IconButton, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Video } from '../types/video';

interface Props {
  videos: Video[];
  onVideoClick: (id: string) => void;
}

export default function ChannelVideoList({ videos, onVideoClick }: Props) {
  return (
    <Box>
      {videos.map((v) => (
        <Box
          key={v.id}
          onClick={() => onVideoClick(v.id)}
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2.5,
            p: 0.5,
            cursor: 'pointer',
            borderRadius: 2,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{
            position: 'relative',
            width: { xs: 150, sm: 240, md: 300 },
            flexShrink: 0,
            aspectRatio: '16/9',
            overflow: 'hidden',
            borderRadius: 1.5,
          }}>
            <CardMedia
              component="img"
              image={v.thumbnail}
              alt={v.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {v.duration && (
              <Box sx={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                bgcolor: 'rgba(0,0,0,.8)',
                color: '#fff',
                px: .7,
                borderRadius: .5,
                fontSize: 12,
              }}>
                {v.duration}
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{
              fontWeight: 600,
              fontSize: { xs: 14, sm: 16 },
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {v.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: .7 }}>
              {v.channelTitle}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {v.views} • {v.postedAt}
            </Typography>

            <Typography variant="body2" color="text.secondary"
              sx={{
                mt: 1,
                display: { xs: 'none', sm: '-webkit-box' },
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
              {v.description}
            </Typography>
          </Box>

          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
