import {
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Video } from '../types/video';

interface VideoCardDetailedProps {
  video: Video;
  isPaidPromotion?: boolean;
  isMuted?: boolean;
  hasCaptions?: boolean;
  isVerified?: boolean;
}

export default function VideoCardDetailed({
  video,
  isPaidPromotion = false,
  isMuted = false,
  hasCaptions = false,
  isVerified = true,
}: VideoCardDetailedProps) {
  const { title, thumbnail, channelTitle, channelThumbnail, duration, views, postedAt } = video;

  return (
    <Card
      elevation={0}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'scale(1.02)' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={thumbnail}
          sx={{ borderRadius: 2, height: 220, objectFit: 'cover' }}
        />

        {isPaidPromotion && (
          <Chip
            icon={<AttachMoneyIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
            label="Includes paid promotion"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: '#fff',
              fontSize: 11,
              height: 24,
            }}
          />
        )}

        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
          {isMuted && (
            <IconButton
              size="small"
              sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
            >
              <VolumeOffIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
          {hasCaptions && (
            <Chip
              icon={<ClosedCaptionIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
              label="CC"
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: 11,
                height: 24,
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}
        </Box>

        {duration && (
          <Chip
            label={duration}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              height: 22,
            }}
          />
        )}
      </Box>

      <CardContent sx={{ display: 'flex', gap: 1, px: 0, py: 1, alignItems: 'flex-start' }}>
        <Avatar src={channelThumbnail} sx={{ width: 36, height: 36 }} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              lineHeight: 1.3,
              textAlign: 'left',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0 }}>
            <Box
              sx={{
                fontSize: '0.875rem',
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {channelTitle}
            </Box>
            {isVerified && <CheckCircleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
          </Box>

          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', textAlign: 'left' }}>
            {views} • {postedAt}
          </Box>
        </Box>

        <IconButton size="small" sx={{ mt: -0.5 }}>
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </CardContent>
    </Card>
  );
}