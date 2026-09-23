import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {
  getChannelDetails,
  getChannelVideos,
  getChannelPlaylists,
  getPlaylistVideos,
} from '../api/youtube';

import type { Channel, Video } from '../types/video';
import type { Playlist, ChannelMode } from '../api/youtube';

import ChannelVideoList from './ChannelVideoList';
import PlaylistCard from './PlaylistCard';

type TabName =
  | 'home'
  | 'videos'
  | 'shorts'
  | 'live'
  | 'playlists'
  | 'posts';

const tabNames: TabName[] = [
  'home',
  'videos',
  'shorts',
  'live',
  'playlists',
  'posts',
];

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [tab, setTab] = useState(0);

  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [selectedPlaylist, setSelectedPlaylist] =
    useState<Playlist | null>(null);

  const [playlistVideos, setPlaylistVideos] = useState<Video[]>([]);

  const [token, setToken] = useState<string | null>(null);
  const [playlistToken, setPlaylistToken] = useState<string | null>(null);
  const [playlistVideoToken, setPlaylistVideoToken] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState('');

  // Infinite-scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Prevent multiple API requests at the same time
  const loadingMoreRef = useRef(false);

  const mode: ChannelMode =
    tab === 2 ? 'shorts' : tab === 3 ? 'live' : 'videos';

  const resetContent = () => {
    setVideos([]);
    setToken(null);

    setPlaylists([]);
    setPlaylistToken(null);

    setSelectedPlaylist(null);

    setPlaylistVideos([]);
    setPlaylistVideoToken(null);
  };

  /**
   * Load channel videos.
   *
   * append=false -> first page
   * append=true  -> next page
   */
  const loadVideos = useCallback(
    async (
      m: ChannelMode = mode,
      next = '',
      append = false,
    ) => {
      if (!channelId) return;

      // Prevent duplicate requests.
      if (loadingMoreRef.current && append) return;

      if (append) {
        loadingMoreRef.current = true;
      }

      setContentLoading(true);

      try {
        const r = await getChannelVideos(
          channelId,
          next,
          m,
        );

        setVideos((prev) =>
          append ? [...prev, ...r.items] : r.items,
        );

        setToken(r.nextPageToken);
      } catch (e) {
        console.error(e);
        setError('Failed to load videos.');
      } finally {
        setContentLoading(false);

        if (append) {
          loadingMoreRef.current = false;
        }
      }
    },
    [channelId, mode],
  );

  /**
   * Load channel playlists.
   */
  const loadPlaylists = useCallback(
    async (
      next = '',
      append = false,
    ) => {
      if (!channelId) return;

      if (append && loadingMoreRef.current) return;

      if (append) {
        loadingMoreRef.current = true;
      }

      setContentLoading(true);

      try {
        const r = await getChannelPlaylists(
          channelId,
          next,
        );

        setPlaylists((prev) =>
          append ? [...prev, ...r.items] : r.items,
        );

        setPlaylistToken(r.nextPageToken);
      } catch (e) {
        console.error(e);
        setError('Failed to load playlists.');
      } finally {
        setContentLoading(false);

        if (append) {
          loadingMoreRef.current = false;
        }
      }
    },
    [channelId],
  );

  /**
   * Open a playlist.
   */
  const openPlaylist = async (p: Playlist) => {
    setSelectedPlaylist(p);
    setPlaylistVideos([]);
    setPlaylistVideoToken(null);

    setContentLoading(true);

    try {
      const r = await getPlaylistVideos(p.id);

      setPlaylistVideos(r.items);
      setPlaylistVideoToken(r.nextPageToken);
    } catch (e) {
      console.error(e);
      setError('Failed to load playlist videos.');
    } finally {
      setContentLoading(false);
    }
  };

  /**
   * Load more playlist videos.
   */
  const loadMorePlaylistVideos = useCallback(async () => {
    if (!selectedPlaylist || !playlistVideoToken) return;

    if (loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setContentLoading(true);

    try {
      const r = await getPlaylistVideos(
        selectedPlaylist.id,
        playlistVideoToken,
      );

      setPlaylistVideos((prev) => [
        ...prev,
        ...r.items,
      ]);

      setPlaylistVideoToken(r.nextPageToken);
    } catch (e) {
      console.error(e);
      setError('Failed to load more playlist videos.');
    } finally {
      setContentLoading(false);
      loadingMoreRef.current = false;
    }
  }, [selectedPlaylist, playlistVideoToken]);

  /**
   * Load channel information.
   */
  useEffect(() => {
    if (!channelId) return;

    let cancelled = false;

    setLoading(true);
    setError('');

    getChannelDetails(channelId)
      .then((c) => {
        if (!cancelled) {
          setChannel(c);
        }
      })
      .catch((e) => {
        console.error(e);

        if (!cancelled) {
          setError('Failed to load channel.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  /**
   * Load the first page when changing tabs/channel.
   */
  useEffect(() => {
    if (!channelId) return;

    resetContent();
    loadingMoreRef.current = false;

    if (tab === 4) {
      loadPlaylists();
    } else if (tab !== 5) {
      loadVideos(mode);
    }
  }, [channelId, tab]);

  /**
   * INFINITE SCROLL
   *
   * Watches the invisible element at the bottom of the content.
   *
   * When it comes within 600px of the viewport,
   * automatically loads the next page.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    // Nothing to load
    const hasMore =
      tab === 4
        ? selectedPlaylist
          ? !!playlistVideoToken
          : !!playlistToken
        : tab !== 5
          ? !!token
          : false;

    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) return;

        // Don't load another page while one is loading.
        if (loadingMoreRef.current) return;

        if (tab === 4) {
          // Playlist list
          if (!selectedPlaylist && playlistToken) {
            loadPlaylists(
              playlistToken,
              true,
            );
          }

          // Videos inside selected playlist
          if (selectedPlaylist && playlistVideoToken) {
            loadMorePlaylistVideos();
          }

          return;
        }

        // Videos / Shorts / Live
        if (tab !== 5 && token) {
          loadVideos(
            mode,
            token,
            true,
          );
        }
      },
      {
        // Start loading before reaching the bottom.
        rootMargin: '600px',
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    tab,
    token,
    mode,
    playlistToken,
    playlistVideoToken,
    selectedPlaylist,
    loadVideos,
    loadPlaylists,
    loadMorePlaylistVideos,
  ]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !channel) {
    return (
      <Typography
        sx={{ p: 4 }}
        color="error"
      >
        {error || 'Channel not found.'}
      </Typography>
    );
  }

  const currentTab = tabNames[tab];

  return (
    <Box
      sx={{
        maxWidth: 1280,
        mx: 'auto',
        pb: 4,
      }}
    >
      {/* BANNER */}
      <Box
        sx={{
          height: {
            xs: 120,
            sm: 180,
            md: 230,
          },
          bgcolor: '#e5e5e5',
          borderRadius: {
            xs: 0,
            sm: 2,
          },
          backgroundImage: channel.banner
            ? `url(${channel.banner})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* CHANNEL INFO */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          px: {
            xs: 2,
            sm: 4,
          },
          py: 3,
        }}
      >
        <Avatar
          src={channel.avatar}
          sx={{
            width: 110,
            height: 110,
          }}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 200,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 0.7,
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {channel.title}
            </Typography>

            <CheckCircleIcon
              sx={{
                fontSize: 20,
                color: 'text.secondary',
              }}
            />
          </Box>

          <Typography
            color="text.secondary"
            variant="body2"
          >
            {channel.handle} • {channel.subscriberCount}{' '}
            subscribers • {channel.videoCount} videos
          </Typography>

          <Typography
            color="text.secondary"
            variant="body2"
            sx={{ mt: 1 }}
          >
            {channel.description}
          </Typography>

          <Button
            variant="contained"
            sx={{
              mt: 2,
              borderRadius: 5,
              textTransform: 'none',
              bgcolor: '#0f0f0f',
            }}
          >
            Subscribe
          </Button>
        </Box>
      </Box>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(_, value) => {
          setTab(value);
          setError('');
        }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
          },
        }}
      >
        {tabNames.map((name) => (
          <Tab
            key={name}
            label={
              name[0].toUpperCase() +
              name.slice(1)
            }
          />
        ))}
      </Tabs>

      {/* CONTENT */}
      <Box
        sx={{
          px: {
            xs: 2,
            sm: 4,
          },
          pt: 3,
        }}
      >
        {/* POSTS */}
        {currentTab === 'posts' && (
          <Typography
            color="text.secondary"
            sx={{
              textAlign: 'center',
            }}
          >
            Community posts are not available through
            the standard YouTube Data API v3.
          </Typography>
        )}

        {/* PLAYLISTS */}
        {currentTab === 'playlists' &&
          !selectedPlaylist && (
            <>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Playlists
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {playlists.map((p) => (
                  <PlaylistCard
                    key={p.id}
                    playlist={p}
                    onClick={() => openPlaylist(p)}
                  />
                ))}
              </Box>

              {!playlists.length &&
                !contentLoading && (
                  <Typography
                    color="text.secondary"
                    sx={{
                      textAlign: 'center',
                      py: 4,
                    }}
                  >
                    No playlists found.
                  </Typography>
                )}
            </>
          )}

        {/* SELECTED PLAYLIST */}
        {currentTab === 'playlists' &&
          selectedPlaylist && (
            <>
              <Button
                onClick={() =>
                  setSelectedPlaylist(null)
                }
                sx={{ mb: 2 }}
              >
                ← Back to playlists
              </Button>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {selectedPlaylist.title}
              </Typography>

              <ChannelVideoList
                videos={playlistVideos}
                onVideoClick={(id) =>
                  navigate(`/watch/${id}`)
                }
              />
            </>
          )}

        {/* VIDEOS / SHORTS / LIVE */}
        {currentTab !== 'playlists' &&
          currentTab !== 'posts' && (
            <>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {currentTab === 'shorts'
                  ? 'Shorts'
                  : currentTab === 'live'
                    ? 'Live'
                    : 'Videos'}
              </Typography>

              <ChannelVideoList
                videos={videos}
                onVideoClick={(id) =>
                  navigate(`/watch/${id}`)
                }
              />

              {!videos.length &&
                !contentLoading && (
                  <Typography
                    color="text.secondary"
                    sx={{
                      textAlign: 'center',
                      py: 4,
                    }}
                  >
                    No videos found.
                  </Typography>
                )}
            </>
          )}

        {/* INFINITE SCROLL SENTINEL */}
        <Box
          ref={sentinelRef}
          sx={{
            height: 20,
            width: '100%',
          }}
        />

        {/* LOADING */}
        {contentLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 3,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        {/* END MESSAGE */}
        {!contentLoading &&
          ((currentTab !== 'playlists' &&
            currentTab !== 'posts' &&
            videos.length > 0 &&
            !token) ||
            (currentTab === 'playlists' &&
              !selectedPlaylist &&
              playlists.length > 0 &&
              !playlistToken) ||
            (currentTab === 'playlists' &&
              selectedPlaylist &&
              playlistVideos.length > 0 &&
              !playlistVideoToken)) && (
            <Typography
              color="text.secondary"
              sx={{
                textAlign: 'center',
                py: 3,
              }}
            >
              You've reached the end.
            </Typography>
          )}
      </Box>
    </Box>
  );
} 