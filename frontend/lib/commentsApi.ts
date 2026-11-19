import { KhojComment } from './types';
import { apiRequest } from './api';

export const fetchCommentsByEventId = async (eventId: string): Promise<KhojComment[]> => {
  return apiRequest<KhojComment[]>(`/comments/event/${eventId}`);
};

export const postComment = async (eventId: string, text: string, token: string): Promise<KhojComment> => {
  return apiRequest<KhojComment>(`/comments/event/${eventId}`, {
    method: 'POST',
    token,
    body: JSON.stringify({ text }),
  });
};

export const deleteComment = async (commentId: string, token: string): Promise<void> => {
  return apiRequest<void>(`/comments/${commentId}`, {
    method: 'DELETE',
    token,
  });
};

export const editComment = async (commentId: string, text: string, token: string): Promise<KhojComment> => {
  return apiRequest<KhojComment>(`/comments/${commentId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ text }),
  });
};
