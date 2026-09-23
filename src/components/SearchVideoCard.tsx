import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Video } from '../types/video';

interface SearchVideoCardProps {
  video: Video;
}

export default function SearchVideoCard({
  video,
}: SearchVideoCardProps) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/watch/${video.id}`)}
      sx={{
        display: 'flex',
        gap: 2,
        width: '100%',
        cursor: 'pointer',
        mb: 3,
        '&:hover .video-title': {
          color: 'text.primary',
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          width: {
            xs: 150,
            sm: 260,
            md: 360,
          },
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: '#eee',
        }}
      >
        <Box
          component="img"
          src={video.thumbnail}
          alt={video.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {video.duration && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.85)',
              color: '#fff',
              px: 0.7,
              py: 0.2,
              borderRadius: 0.5,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {video.duration}
          </Box>
        )}
      </Box>

      {/* Video details */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          className="video-title"
          sx={{
            fontSize: {
              xs: 14,
              sm: 17,
              md: 18,
            },
            fontWeight: 500,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 0.8,
          }}
        >
          {video.title}
        </Typography>

        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 13,
            mb: 1,
          }}
        >
          {video.views} • {video.postedAt}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <Avatar
            src={video.channelThumbnail}
            sx={{
              width: 28,
              height: 28,
            }}
          />

          <Typography
            sx={{
              fontSize: 13,
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {video.channelTitle}
            <CheckCircleIcon sx={{ fontSize: 14 }} />
          </Typography>
        </Box>

        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 13,
            display: {
              xs: 'none',
              sm: '-webkit-box',
            },
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.description}
        </Typography>
      </Box>

      {/* More options */}
      <IconButton
        size="small"
        onClick={(e) => e.stopPropagation()}
        sx={{
          alignSelf: 'flex-start',
        }}
      >
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
}
