export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail: string;
  duration: string;
  views: string;
  likes: string;
  postedAt: string;
}

export interface Channel {
  id: string;
  title: string;
  handle: string;
  description: string;
  avatar: string;
  banner: string;
  subscriberCount: string;
  videoCount: string;
}