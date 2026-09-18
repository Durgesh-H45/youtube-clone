import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Avatar, CircularProgress } from '@mui/material';
import { getComments } from '../api/comments';
import type { Comment } from '../types/Comment';

interface CommentsListProps {
  videoId: string;
}

export default function CommentsList({ videoId }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await getComments(videoId, nextPageToken || '');
      setComments((prev) => [...prev, ...result.comments]);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      setCommentsDisabled(true);
    } finally {
      setLoading(false);
    }
  }, [videoId, nextPageToken, loading]);

  // Reset when switching to a different video
  useEffect(() => {
    setComments([]);
    setNextPageToken(null);
    setCommentsDisabled(false);
  }, [videoId]);

  // Load the first page once reset happens
  useEffect(() => {
    if (comments.length === 0 && !commentsDisabled) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Watch the sentinel div; when it scrolls into view, load the next page
  useEffect(() => {
    if (!sentinelRef.current || !nextPageToken) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' } // start loading a bit before it's fully visible
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextPageToken, loadMore]);

  if (commentsDisabled) {
    return (
      <Box sx={{ mt: 3, color: 'text.secondary', fontSize: 14 }}>
        Comments are turned off for this video.
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>Comments</Box>

      {comments.map((comment) => (
        <Box key={comment.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Avatar src={comment.authorAvatar} sx={{ width: 36, height: 36 }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ fontSize: 13, fontWeight: 600 }}>{comment.authorName}</Box>
              <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{comment.postedAt}</Box>
            </Box>
            <Box sx={{ fontSize: 14, mt: 0.3 }}>{comment.text}</Box>
            <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
              👍 {comment.likeCount}
            </Box>
          </Box>
        </Box>
      ))}

      {/* Invisible marker element — when this scrolls into view, more comments load */}
      <Box ref={sentinelRef} sx={{ height: 1 }} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}