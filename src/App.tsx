import { useState } from 'react';
import Box from '@mui/material/Box';
import YouTubeAppBarLight from './components/appbar';
import Drawer from './components/drawer';
import VideoGrid from './components/videogrid';

function App() {
  const [open, setOpen] = useState<boolean>(true); 

  return (
    <Box sx={{ display: 'flex' }}>
      <YouTubeAppBarLight onMenuClick={() => setOpen((prev) => !prev)} />
      <Drawer open={open} onClose={() => setOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin-left 0.2s',
          marginLeft: 0,  
        }}
      >
        <Box sx={{ height: 64 }} />
        <VideoGrid />
      </Box>
    </Box>
  );
}

export default App;