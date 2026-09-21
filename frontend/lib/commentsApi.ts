import { KhojComment } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchCommentsByEventId = async (eventId: string): Promise<KhojComment[]> => {
  const response = await fetch(`${API_BASE_URL}/comments/event/${eventId}`, {
    cache: 'no-store', // Always fetch fresh comments
  });

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
};

export const postComment = async (eventId: string, text: string, token: string): Promise<KhojComment> => {
  const response = await fetch(`${API_BASE_URL}/comments/event/${eventId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to post comment');
  }

  return response.json();
};

export const deleteComment = async (commentId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }
};

export const editComment = async (commentId: string, text: string, token: string): Promise<KhojComment> => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to edit comment');
  }

  return response.json();
};
