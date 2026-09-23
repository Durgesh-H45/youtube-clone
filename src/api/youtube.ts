
import type { Video, Channel } from '../types/video';

const KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE = 'https://www.googleapis.com/youtube/v3';
const requestCache = new Map<string, Promise<any>>();

export type ChannelMode = 'videos' | 'shorts' | 'live';

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: string;
}

export interface Page<T> {
  items: T[];
  nextPageToken: string | null;
}

const json = async (url: string) => {
  const cached = requestCache.get(url);

  if (cached) {
    return cached;
  }

  const request = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        let message = `YouTube API error: ${res.status}`;

        try {
          const data = await res.json();

          console.error('YouTube API error:', data);

          const reason =
            data?.error?.errors?.[0]?.reason ||
            data?.error?.status ||
            data?.error?.message;

          if (reason) {
            message += ` - ${reason}`;
          }
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      return res.json();
    })
    .catch((error) => {
      // Don't keep failed requests in the cache
      requestCache.delete(url);
      throw error;
    });

  requestCache.set(url, request);

  return request;
};  

const count = (v: string | number = 0) => {
  const n = Number(v);
  return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` :
    n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;
};

const thumb = (t: any) =>
  t?.high?.url || t?.medium?.url || t?.default?.url || '';

const duration = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = +(m?.[1] || 0), min = +(m?.[2] || 0), s = +(m?.[3] || 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
};

const seconds = (iso: string) => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return +(m?.[1] || 0) * 3600 + +(m?.[2] || 0) * 60 + +(m?.[3] || 0);
};

const ago = (date: string) => {
  const sec = Math.max(0, (Date.now() - Date.parse(date)) / 1000);
  const units: [number, string][] = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'],
  ];
  for (const [size, name] of units) {
    const n = Math.floor(sec / size);
    if (n) return `${n} ${name}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

async function details(ids: string) {
  if (!ids) return [];
  const data = await json(
    `${BASE}/videos?part=contentDetails,statistics&id=${ids}&key=${KEY}`
  );
  return data.items || [];
}

async function avatars(ids: string[]) {
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return {};

  const data = await json(
    `${BASE}/channels?part=snippet&id=${unique.join(',')}&key=${KEY}`
  );

  return Object.fromEntries(
    (data.items || []).map((c: any) => [
      c.id,
      thumb(c.snippet?.thumbnails),
    ])
  );
}

async function mapVideos(items: any[], ds: any[]): Promise<Video[]> {
  const valid = items.filter((x) => x.id?.videoId);
  const av = await avatars(valid.map((x) => x.snippet.channelId));

  return valid.map((x) => {
    const s = x.snippet;
    const d = ds.find((v: any) => v.id === x.id.videoId);

    return {
      id: x.id.videoId,
      title: s.title,
      description: s.description || '',
      thumbnail: thumb(s.thumbnails),
      channelId: s.channelId,
      channelTitle: s.channelTitle,
      channelThumbnail: av[s.channelId] || '',
      duration: duration(d?.contentDetails?.duration || ''),
      views: `${count(d?.statistics?.viewCount)} views`,
      likes: count(d?.statistics?.likeCount),
      postedAt: ago(s.publishedAt),
    };
  });
}

export async function getChannelDetails(id: string): Promise<Channel> {
  const d = await json(
    `${BASE}/channels?part=snippet,statistics,brandingSettings&id=${id}&key=${KEY}`
  );
  const c = d.items?.[0];
  if (!c) throw new Error('Channel not found');

  return {
    id: c.id,
    title: c.snippet.title,
    handle: c.snippet.customUrl || '',
    description: c.snippet.description || '',
    avatar: thumb(c.snippet.thumbnails),
    banner: c.brandingSettings?.image?.bannerExternalUrl || '',
    subscriberCount: c.statistics?.hiddenSubscriberCount
      ? 'Hidden' : count(c.statistics?.subscriberCount),
    videoCount: count(c.statistics?.videoCount),
  };
}

export async function getChannelVideos(
  channelId: string,
  token = '',
  mode: ChannelMode = 'videos'
): Promise<Page<Video>> {
  const p = new URLSearchParams({
    part: 'snippet',
    channelId,
    type: 'video',
    order: 'date',
    maxResults: mode === 'shorts' ? '50' : '12',
    key: KEY,
  });

  if (token) p.set('pageToken', token);
  if (mode === 'live') p.set('eventType', 'completed');

  const data = await json(`${BASE}/search?${p}`);
  const items = data.items || [];
  const ids = items.map((x: any) => x.id?.videoId).filter(Boolean).join(',');
  const ds = await details(ids);
  let videos = await mapVideos(items, ds);

  if (mode === 'shorts') {
    const shortIds = new Set(
      ds.filter((x: any) => seconds(x.contentDetails?.duration || '') <= 180)
        .map((x: any) => x.id)
    );
    videos = videos.filter((v) => shortIds.has(v.id));
  }

  return { items: videos, nextPageToken: data.nextPageToken || null };
}

export async function getChannelPlaylists(
  channelId: string,
  token = ''
): Promise<Page<Playlist>> {
  const p = new URLSearchParams({
    part: 'snippet,contentDetails',
    channelId,
    maxResults: '12',
    key: KEY,
  });
  if (token) p.set('pageToken', token);

  const data = await json(`${BASE}/playlists?${p}`);

  return {
    items: (data.items || []).map((x: any) => ({
      id: x.id,
      title: x.snippet.title,
      description: x.snippet.description || '',
      thumbnail: thumb(x.snippet.thumbnails),
      videoCount: count(x.contentDetails?.itemCount),
    })),
    nextPageToken: data.nextPageToken || null,
  };
}

export async function getPlaylistVideos(
  playlistId: string,
  token = ''
): Promise<Page<Video>> {
  const p = new URLSearchParams({
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: '12',
    key: KEY,
  });
  if (token) p.set('pageToken', token);

  const data = await json(`${BASE}/playlistItems?${p}`);
  const items = (data.items || []).filter(
    (x: any) => x.snippet?.resourceId?.videoId
  );

  const ids = items.map(
    (x: any) => x.snippet.resourceId.videoId
  ).join(',');

  const ds = await details(ids);

  const searchItems = items.map((x: any) => ({
    id: { videoId: x.snippet.resourceId.videoId },
    snippet: {
      ...x.snippet,
      channelId: x.snippet.videoOwnerChannelId || x.snippet.channelId || '',
      channelTitle: x.snippet.videoOwnerChannelTitle || x.snippet.channelTitle || '',
    },
  }));

  return {
    items: await mapVideos(searchItems, ds),
    nextPageToken: data.nextPageToken || null,
  };
}

export type VideoSearchOptions = {
  videoDuration?: 'short' | 'medium' | 'long';
  eventType?: 'live' | 'completed' | 'upcoming';
  publishedAfter?: string;
};

export async function getVideos(
  query: string,
  token = '',
  options: VideoSearchOptions = {}
): Promise<Page<Video>> {
  const p = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    order: 'relevance',
    maxResults: '12',
    key: KEY,
  });

  if (token) p.set('pageToken', token);

  if (options.videoDuration) {
    p.set('videoDuration', options.videoDuration);
  }

  if (options.eventType) {
    p.set('eventType', options.eventType);
  }

  if (options.publishedAfter) {
    p.set('publishedAfter', options.publishedAfter);
  }

  const data = await json(`${BASE}/search?${p}`);

  const items = data.items || [];

  const ids = items
    .map((x: any) => x.id?.videoId)
    .filter(Boolean)
    .join(',');

  const ds = await details(ids);
  const videos = await mapVideos(items, ds);

  return {
    items: videos,
    nextPageToken: data.nextPageToken || null,
  };
}

export async function getVideoById(
  videoId: string
): Promise<Video | null> {
  const p = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: videoId,
    key: KEY,
  });

  const data = await json(`${BASE}/videos?${p}`);

  if (!data.items || data.items.length === 0) {
    return null;
  }

  const item = data.items[0];

  const channelId = item.snippet.channelId;
  const channelTitle = item.snippet.channelTitle;

  // Get channel avatar
  const channelAvatars = await avatars([channelId]);

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description || '',

    thumbnail:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.default?.url ||
      '',

    channelId,
    channelTitle,

    channelThumbnail:
      channelAvatars[channelId] || '',

    duration: duration(
      item.contentDetails?.duration || ''
    ),

    views: `${count(item.statistics?.viewCount)} views`,

    likes: count(
      item.statistics?.likeCount
    ),

    postedAt: ago(
      item.snippet.publishedAt
    ),
  };
}