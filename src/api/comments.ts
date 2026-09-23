import type { Comment } from '../types/Comment';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

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

function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

export async function getComments(
  videoId: string,
  pageToken: string = ''
): Promise<{ comments: Comment[]; nextPageToken: string | null }> {
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&order=relevance${pageToken ? `&pageToken=${pageToken}` : ''
    }&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  const comments: Comment[] = data.items.map((item: any) => {
    const snippet = item.snippet.topLevelComment.snippet;
    return {
      id: item.id,
      authorName: snippet.authorDisplayName,
      authorAvatar: snippet.authorProfileImageUrl,
      text: snippet.textOriginal,
      likeCount: formatCount(snippet.likeCount.toString()),
      postedAt: formatPostedAt(snippet.publishedAt),
    };
  });

  return {
    comments,
    nextPageToken: data.nextPageToken || null,
  };
}