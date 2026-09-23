import { useNavigate } from 'react-router-dom';
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
}: VideoCardDetailedProps) {
  const navigate = useNavigate();

  const {
    id,
    title,
    thumbnail,
    channelId,
    channelTitle,
    channelThumbnail,
    duration,
    views,
    postedAt,
  } = video;

  /*
   * Navigate to channel page.
   *
   * stopPropagation() is important because the whole Card
   * is clickable and normally navigates to /watch/:videoId.
   */
  const handleChannelClick = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!channelId) {
      console.error(
        'Channel ID is missing for video:',
        id
      );
      return;
    }

    navigate(`/channel/${channelId}`);
  };

  /*
   * Navigate to the video page.
   */
  const handleVideoClick = () => {
    navigate(`/watch/${id}`);
  };

  /*
   * Prevent the More button from opening the video page.
   */
  const handleMoreClick = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
  };

  return (
    <Card
      onClick={handleVideoClick}
      elevation={0}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        transition: 'transform 0.2s ease',

        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      {/* =========================
          VIDEO THUMBNAIL
        */}
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <CardMedia
          component="img"
          image={thumbnail}
          alt={title}
          sx={{
            borderRadius: 2,
            height: 220,
            objectFit: 'cover',
          }}
        />

        {/* Paid promotion */}
        {isPaidPromotion && (
          <Chip
            icon={
              <AttachMoneyIcon
                sx={{
                  fontSize: 16,
                  color: '#fff !important',
                }}
              />
            }
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

        {/* Top-right badges */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
          }}
        >
          {/* Muted */}
          {isMuted && (
            <IconButton
              size="small"
              onClick={(e) => e.stopPropagation()}
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                color: '#fff',

                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.8)',
                },
              }}
            >
              <VolumeOffIcon
                sx={{
                  fontSize: 16,
                }}
              />
            </IconButton>
          )}

          {/* Captions */}
          {hasCaptions && (
            <Chip
              icon={
                <ClosedCaptionIcon
                  sx={{
                    fontSize: 16,
                    color: '#fff !important',
                  }}
                />
              }
              label="CC"
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: 11,
                height: 24,

                '& .MuiChip-label': {
                  px: 0.5,
                },
              }}
            />
          )}
        </Box>

        {/* Duration */}
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

      {/*  VIDEO INFORMATION */}
      <CardContent
        sx={{
          display: 'flex',
          gap: 1,
          px: 0,
          py: 1,
          alignItems: 'flex-start',
        }}
      >
        {/* CHANNEL AVATAR */}
        <Avatar
          src={channelThumbnail}
          alt={channelTitle}
          onClick={handleChannelClick}
          sx={{
            width: 36,
            height: 36,
            cursor: channelId
              ? 'pointer'
              : 'default',

            '&:hover': channelId
              ? {
                  opacity: 0.8,
                }
              : undefined,
          }}
        />
        {/* TEXT INFORMATION */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          {/* Video title */}
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
          {/* Channel name */}
          <Box
            onClick={handleChannelClick}
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',

              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',

              cursor: channelId
                ? 'pointer'
                : 'default',

              width: 'fit-content',
              maxWidth: '100%',

              '&:hover': channelId
                ? {
                    color: 'text.primary',
                  }
                : undefined,
            }}
          >
            {channelTitle}
          </Box>

          {/* Views + upload time */}
          <Box
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              textAlign: 'left',
            }}
          >
            {views} • {postedAt}
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={handleMoreClick}
          sx={{
            mt: -0.5,
          }}
        >
          <MoreVertIcon
            sx={{
              fontSize: 20,
            }}
          />
        </IconButton>
      </CardContent>
    </Card>
  );
}