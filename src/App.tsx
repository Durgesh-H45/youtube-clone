import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import YouTubeAppBarLight from './components/appbar';
import Drawer from './components/drawer';
import VideoGrid from './components/videogrid';
import VideoPlayerPage from './components/VideoPlayerPage';

function App() {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <YouTubeAppBarLight onMenuClick={() => setOpen((prev) => !prev)} />
      <Drawer open={open} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box sx={{ height: 64 }} />
        <Routes>
          <Route path="/" element={<VideoGrid />} />
          <Route path="/watch/:videoId" element={<VideoPlayerPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;