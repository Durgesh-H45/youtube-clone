
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';

import {
  useNavigate,
  useLocation,
} from 'react-router-dom';

import MenuIcon from '@mui/icons-material/Menu';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import { useEffect, useState } from 'react';

const MY_CHANNEL_ID = 'UCahCFTGXucpsDdzqsZDMqZQ';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
});

interface YouTubeAppBarLightProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
}

export default function YouTubeAppBarLight({
  onMenuClick,
  onSearch,
}: YouTubeAppBarLightProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');

  // Sync search bar with the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const query = params.get('search_query') || '';

    if (location.pathname === '/results') {
      setSearchQuery(query);
    }
  }, [location.pathname, location.search]);

  // Handle search
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) return;

    // Update search query in App.tsx
    onSearch(trimmedQuery);

    // Navigate to the search results page
    navigate(
      `/results?search_query=${encodeURIComponent(trimmedQuery)}`
    );
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'rgba(0,0,0,0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            gap: 2,
            px: 2,
          }}
        >

          {/* LEFT SECTION: Menu + YouTube Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
            }}
          >
            <IconButton
              edge="start"
              sx={{ color: 'text.primary' }}
              onClick={onMenuClick}
            >
              <MenuIcon />
            </IconButton>

            <Box
              onClick={() => navigate('/')}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.5,
                cursor: 'pointer',
              }}
            >
              <YouTubeIcon
                sx={{
                  color: '#ff0000',
                  fontSize: 28,
                  mt: 0.3,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  letterSpacing: -0.5,
                  fontSize: 20,
                  color: 'text.primary',
                }}
              >
                YouTube
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: 11,
                  mt: 0.2,
                }}
              >
                IN
              </Typography>
            </Box>
          </Box>

          {/* CENTER SECTION: Search Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              maxWidth: 640,
              justifyContent: 'center',
              mx: 'auto',
            }}
          >
            {/* Search Input */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                border: '1px solid',
                borderColor: 'rgba(0,0,0,0.2)',
                borderRadius: '20px 0 0 20px',
                bgcolor: '#ffffff',
                pl: 2,
                height: 40,
              }}
            >
              <InputBase
                placeholder="Search"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                fullWidth
                sx={{
                  color: 'text.primary',
                  fontSize: 15,
                }}
              />
            </Box>

            {/* Search Button */}
            <IconButton
              onClick={handleSearch}
              sx={{
                borderRadius: '0 20px 20px 0',
                border: '1px solid',
                borderColor: 'rgba(0,0,0,0.2)',
                borderLeft: 'none',
                bgcolor: '#f8f8f8',
                height: 40,
                width: 64,
                color: 'text.primary',
              }}
            >
              <SearchIcon />
            </IconButton>

            {/* Microphone Button */}
            <IconButton
              sx={{
                ml: 1.5,
                bgcolor: '#f1f1f1',
                height: 40,
                width: 40,
                color: 'text.primary',
              }}
            >
              <MicIcon />
            </IconButton>
          </Box>

          {/* RIGHT SECTION: Create + Notifications + Avatar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            {/* Create Button */}
            <Button
              startIcon={<AddIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: '#f2f2f2',
                color: 'text.primary',
                borderRadius: 5,
                px: 2,
                '&:hover': {
                  bgcolor: '#e5e5e5',
                },
              }}
            >
              Create
            </Button>

            {/* Notifications */}
            <IconButton sx={{ color: 'text.primary' }}>
              <Badge
                variant="dot"
                color="error"
                overlap="circular"
              >
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>

            {/* User Avatar */}
            <Avatar
              onClick={() =>
                navigate(`/channel/${MY_CHANNEL_ID}`)
              }
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#e65100',
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              D
            </Avatar>
          </Box>

        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
