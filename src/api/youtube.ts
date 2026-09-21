import type { Video, Channel } from '../types/video';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match?.[1] || '0', 10);
  const minutes = parseInt(match?.[2] || '0', 10);
  const seconds = parseInt(match?.[3] || '0', 10);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function formatPostedAt(publishedAt: string): string {
  const seconds = Math.floor((Date.now() - new Date(publishedAt).getTime()) / 1000);
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'year'],
    [60 * 60 * 24 * 30, 'month'],
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];
  for (const [secondsInUnit, label] of units) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

async function getChannelAvatars(channelIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = [...new Set(channelIds)].join(',');
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${uniqueIds}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  const map: Record<string, string> = {};
  data.items.forEach((channel: any) => {
    map[channel.id] = channel.snippet.thumbnails.default.url;
  });
  return map;
}

interface GetVideosResult {
  videos: Video[];
  nextPageToken: string | null;
}

export async function getVideos(
  query: string,
  pageToken: string = ''
): Promise<GetVideosResult> {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(
    query
  )}${pageToken ? `&pageToken=${pageToken}` : ''}&key=${API_KEY}`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  const channelAvatarMap = await getChannelAvatars(
    searchData.items.map((item: any) => item.snippet.channelId)
  );

  const videos: Video[] = searchData.items.map((item: any) => {
    const details = detailsData.items.find((d: any) => d.id === item.id.videoId);
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      channelThumbnail: channelAvatarMap[item.snippet.channelId] || '',
      duration: details ? formatDuration(details.contentDetails.duration) : '',
      views: details ? `${formatCount(details.statistics.viewCount)} views` : '',
      likes: details ? formatCount(details.statistics.likeCount || '0') : '',
      postedAt: formatPostedAt(item.snippet.publishedAt),
    };
  });

  return {
    videos,
    nextPageToken: searchData.nextPageToken || null,
  };
}

export async function getVideoById(videoId: string): Promise<Video> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const item = data.items[0];

  const channelAvatarMap = await getChannelAvatars([item.snippet.channelId]);

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    channelThumbnail: channelAvatarMap[item.snippet.channelId] || '',
    duration: formatDuration(item.contentDetails.duration),
    views: `${formatCount(item.statistics.viewCount)} views`,
    likes: formatCount(item.statistics.likeCount || '0'),
    postedAt: formatPostedAt(item.snippet.publishedAt),
  };
}

export async function getChannelDetails(channelId: string): Promise<Channel> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const item = data.items[0];

  return {
    id: item.id,
    title: item.snippet.title,
    handle: item.snippet.customUrl || '',
    description: item.snippet.description,
    avatar: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
    banner: item.brandingSettings?.image?.bannerExternalUrl || '',
    subscriberCount: item.statistics.hiddenSubscriberCount
      ? 'Hidden'
      : formatCount(item.statistics.subscriberCount),
    videoCount: formatCount(item.statistics.videoCount),
  };
}
export async function getChannelVideos(
  channelId: string,
  pageToken: string = ''
): Promise<GetVideosResult> {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=12${pageToken ? `&pageToken=${pageToken}` : ''
    }&key=${API_KEY}`;

  const searchRes = await fetch(searchUrl);

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(
      `YouTube search API error ${searchRes.status}: ${errorText}`
    );
  }

  const searchData = await searchRes.json();

  if (!searchData.items) {
    throw new Error('No video items returned from YouTube API');
  }

  const videoIds = searchData.items
    .map((item: any) => item.id.videoId)
    .filter(Boolean)
    .join(',');

  if (!videoIds) {
    return {
      videos: [],
      nextPageToken: searchData.nextPageToken || null,
    };
  }

  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;

  const detailsRes = await fetch(detailsUrl);

  if (!detailsRes.ok) {
    const errorText = await detailsRes.text();
    throw new Error(
      `YouTube details API error ${detailsRes.status}: ${errorText}`
    );
  }

  const detailsData = await detailsRes.json();

  const channelAvatarMap = await getChannelAvatars(
    searchData.items
      .map((item: any) => item.snippet.channelId)
      .filter(Boolean)
  );

  const videos: Video[] = searchData.items.map((item: any) => {
    const details = detailsData.items?.find(
      (d: any) => d.id === item.id.videoId
    );

    return {
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      channelThumbnail: channelAvatarMap[item.snippet.channelId] || '',
      duration: details
        ? formatDuration(details.contentDetails.duration)
        : '',
      views: details
        ? `${formatCount(details.statistics.viewCount)} views`
        : '',
      likes: details
        ? formatCount(details.statistics.likeCount || '0')
        : '',
      postedAt: formatPostedAt(item.snippet.publishedAt),
    };
  });

  return {
    videos,
    nextPageToken: searchData.nextPageToken || null,
  };
}