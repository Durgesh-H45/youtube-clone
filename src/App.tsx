import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import YouTubeAppBarLight from './components/appbar';
import Drawer from './components/drawer';
import VideoGrid from './components/videogrid';
import VideoPlayerPage from './components/VideoPlayerPage';
import ChannelPage from './components/ChannelPage';
import SearchPage from './components/SearchPage';

function App() {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('react hooks');

  return (
    <Box sx={{ display: 'flex' }}>
      <YouTubeAppBarLight
        onMenuClick={() => setOpen((prev) => !prev)}
        onSearch={setSearchQuery}
      />

      <Drawer open={open} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box sx={{ height: 64 }} />

        <Routes>
          <Route
            path="/"
            element={<VideoGrid query={searchQuery} />}
          />

          <Route
            path="/watch/:videoId"
            element={<VideoPlayerPage />}
          />

          <Route
            path="/channel/:channelId"
            element={<ChannelPage />}
          />

          <Route
            path="/results"
            element={<SearchPage />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;