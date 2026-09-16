import type { Video } from '../types/video';

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

function formatViews(viewCount: string): string {
  const num = parseInt(viewCount, 10);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K views`;
  return `${num} views`;
}

function formatPostedAt(publishedAt: string): string {
  const published = new Date(publishedAt).getTime();
  const seconds = Math.floor((Date.now() - published) / 1000);
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

export async function getVideos(query: string): Promise<Video[]> {
  // Step 1: search for videos matching the query
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${query}&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  // Step 2: fetch real duration + view count for those video IDs
  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  // Step 3: fetch channel avatars for the unique channels in these results
  const uniqueChannelIds = [
    ...new Set(searchData.items.map((item: any) => item.snippet.channelId)),
  ].join(',');

  const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${uniqueChannelIds}&key=${API_KEY}`;
  const channelsRes = await fetch(channelsUrl);
  const channelsData = await channelsRes.json();

  // Build a quick lookup: channelId -> avatar URL
  const channelAvatarMap: Record<string, string> = {};
  channelsData.items.forEach((channel: any) => {
    channelAvatarMap[channel.id] = channel.snippet.thumbnails.default.url;
  });

  // Merge everything together
  const videos: Video[] = searchData.items.map((item: any) => {
    const details = detailsData.items.find((d: any) => d.id === item.id.videoId);

    return {
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      channelThumbnail: channelAvatarMap[item.snippet.channelId] || '',
      duration: details ? formatDuration(details.contentDetails.duration) : '',
      views: details ? formatViews(details.statistics.viewCount) : '',
      postedAt: formatPostedAt(item.snippet.publishedAt),
    };
  });

  return videos;
}