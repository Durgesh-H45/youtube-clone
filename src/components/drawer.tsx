import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer as MuiDrawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Divider,
  Typography,
  Box,
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import SubscriptionsOutlinedIcon from '@mui/icons-material/SubscriptionsOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import HistoryIcon from '@mui/icons-material/History';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import LiveTvOutlinedIcon from '@mui/icons-material/LiveTvOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';

const OPEN_WIDTH = 240;
const CLOSED_WIDTH = 72;
const MY_CHANNEL_ID = 'UCahCFTGXucpsDdzqsZDMqZQ';

interface NavItem {
  text: string;
  icon: React.ReactElement;
  selected?: boolean;
  path?: string;
}

const topNav: NavItem[] = [
  { text: 'Home', icon: <HomeIcon />, selected: true, path: '/' },
  { text: 'Shorts', icon: <SlideshowOutlinedIcon /> },
  { text: 'Subscriptions', icon: <SubscriptionsOutlinedIcon /> },
];

const youCollapsed: NavItem = { text: 'You', icon: <PersonOutlineIcon />, path: `/channel/${MY_CHANNEL_ID}` };

const youNav: NavItem[] = [
  { text: 'Your channel', icon: <PersonOutlineIcon />, path: `/channel/${MY_CHANNEL_ID}` },
  { text: 'History', icon: <HistoryIcon /> },
  { text: 'Playlists', icon: <PlaylistPlayIcon /> },
  { text: 'Watch Later', icon: <WatchLaterOutlinedIcon /> },
  { text: 'Liked videos', icon: <ThumbUpOutlinedIcon /> },
  { text: 'Your videos', icon: <VideoLibraryOutlinedIcon /> },
  { text: 'Downloads', icon: <DownloadOutlinedIcon /> },
];

const moreFromYouTube: NavItem[] = [
  { text: 'Try Premium for $0', icon: <YouTubeIcon sx={{ color: '#ff0000' }} /> },
  { text: 'YouTube Music', icon: <YouTubeIcon sx={{ color: '#ff0000' }} /> },
  { text: 'YouTube Kids', icon: <YouTubeIcon sx={{ color: '#ff0000' }} /> },
];

const exploreNav: NavItem[] = [
  { text: 'Shopping', icon: <ShoppingBagOutlinedIcon /> },
  { text: 'Music', icon: <MusicNoteOutlinedIcon /> },
  { text: 'Movies & TV', icon: <LiveTvOutlinedIcon /> },
];

const footerLinks: string[][] = [
  ['About', 'Press', 'Copyright', 'Contact us', 'Creator', 'Advertise', 'Developers'],
  ['Terms', 'Privacy', 'Policy & Safety', 'How YouTube works', 'Test new features'],
];

function NavList({ items }: { items: NavItem[] }) {
  const navigate = useNavigate();
  return (
    <List disablePadding>
      {items.map(({ text, icon, selected, path }) => (
        <ListItemButton
          key={text}
          selected={selected}
          onClick={() => path && navigate(path)}
          sx={{ borderRadius: 2, mx: 1, my: 0.2 }}
        >
          <ListItemIcon sx={{ minWidth: 24, mr: 2 }}>{icon}</ListItemIcon>
          <ListItemText primary={text} slotProps={{ primary: { sx: { fontSize: 14 } } }} />
        </ListItemButton>
      ))}
    </List>
  );
}

function CollapsedItem({ text, icon, selected, path }: NavItem) {
  const navigate = useNavigate();
  return (
    <ListItemButton
      selected={selected}
      onClick={() => path && navigate(path)}
      sx={{
        flexDirection: 'column',
        py: 1.5,
        borderRadius: 2,
        mx: 0.5,
        my: 0.2,
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>{icon}</ListItemIcon>
      <Typography sx={{ fontSize: 10, mt: 0.5 }}>{text}</Typography>
    </ListItemButton>
  );
}

interface YouTubeSidebarProps {
  open: boolean;
}

export default function YouTubeSidebar({ open }: YouTubeSidebarProps) {
  return (
    <MuiDrawer
      variant="persistent"
      open={true}
      sx={{
        width: open ? OPEN_WIDTH : CLOSED_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: (theme) => theme.transitions.create('width'),
        '& .MuiDrawer-paper': {
          width: open ? OPEN_WIDTH : CLOSED_WIDTH,
          overflowX: 'hidden',
          boxSizing: 'border-box',
          transition: (theme) => theme.transitions.create('width'),
          border: 'none',
        },
      }}
    >
      <Toolbar />

      {open ? (
        <>
          <NavList items={topNav} />
          <Divider sx={{ my: 1 }} />

          <ListItemButton sx={{ mx: 1 }}>
            <ListItemText primary="You" slotProps={{ primary: { sx: { fontWeight: 500, fontSize: 14 } } }} />
            <ChevronRightIcon fontSize="small" />
          </ListItemButton>
          <NavList items={youNav} />
          <ListItemButton sx={{ mx: 1 }}>
            <ListItemIcon sx={{ minWidth: 24, mr: 2 }}>
              <ExpandMoreIcon />
            </ListItemIcon>
            <ListItemText primary="Show more" slotProps={{ primary: { sx: { fontSize: 14 } } }} />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />

          <ListSubheader sx={{ fontSize: 13, fontWeight: 500, lineHeight: '32px' }}>
            More from YouTube
          </ListSubheader>
          <NavList items={moreFromYouTube} />
          <Divider sx={{ my: 1 }} />

          <ListSubheader sx={{ fontSize: 13, fontWeight: 500, lineHeight: '32px' }}>
            Explore
          </ListSubheader>
          <NavList items={exploreNav} />
          <ListItemButton sx={{ mx: 1 }}>
            <ListItemIcon sx={{ minWidth: 24, mr: 2 }}>
              <ExpandMoreIcon />
            </ListItemIcon>
            <ListItemText primary="Show more" slotProps={{ primary: { sx: { fontSize: 14 } } }} />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />

          <NavList items={[{ text: 'Report history', icon: <FlagOutlinedIcon /> }]} />
          <Divider sx={{ my: 1 }} />

          <Box sx={{ px: 2, py: 1 }}>
            {footerLinks.map((row, i) => (
              <Typography key={i} variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                {row.join(' ')}
              </Typography>
            ))}
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1 }}>
              © 2026 Google LLC
            </Typography>
          </Box>
        </>
      ) : (
        <List disablePadding>
          {topNav.map((item) => (
            <CollapsedItem key={item.text} {...item} />
          ))}
          <CollapsedItem {...youCollapsed} />
        </List>
      )}
    </MuiDrawer>
  );
}