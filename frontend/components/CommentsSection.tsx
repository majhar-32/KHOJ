"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { KhojComment } from "@/lib/types";
import { fetchCommentsByEventId, postComment, deleteComment as apiDeleteComment, editComment } from "@/lib/commentsApi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MessageSquare, Trash2, Send, Loader2, Pencil, X, Check } from "lucide-react";

// Simple relative time formatter
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

export function CommentsSection({ eventId }: { eventId: string }) {
  const { isAuthenticated, token, user } = useAuth();
  const [comments, setComments] = useState<KhojComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [eventId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCommentsByEventId(eventId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !token) return;

    try {
      setSubmitting(true);
      setError(null);
      const postedComment = await postComment(eventId, newComment, token);
      setComments((prev) => [...prev, postedComment]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment", err);
      setError("Failed to post your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated || !token) return;
    
    // Optimistically remove from UI
    const previousComments = [...comments];
    setComments(comments.filter((c) => c.id !== commentId));

    try {
      await apiDeleteComment(commentId, token);
    } catch (err) {
      console.error("Failed to delete comment", err);
      // Revert if failed
      setComments(previousComments);
      setError("Failed to delete comment.");
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!isAuthenticated || !token || !editCommentText.trim()) return;

    try {
      setEditSubmitting(true);
      setError(null);
      const updatedComment = await editComment(commentId, editCommentText, token);
      
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      setEditingCommentId(null);
    } catch (err) {
      console.error("Failed to edit comment", err);
      setError("Failed to edit comment.");
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-border-default bg-bg-surface mt-8 flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 shadow-sm border-border-default bg-bg-surface mt-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-accent" />
        <h3 className="text-2xl font-bold text-text-primary">Discussions</h3>
      </div>
      <p className="text-sm text-text-secondary mb-6">
        Connect with other participants and discuss the event.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full min-h-[100px] sm:min-h-[60px] p-3 rounded-xl border border-border-default bg-bg-surface-secondary text-text-primary focus:ring-2 focus:ring-accent focus:border-accent resize-y transition-shadow placeholder:text-text-muted"
                disabled={submitting}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting || !newComment.trim()} className="w-full sm:w-auto shrink-0">
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-bg-surface-secondary rounded-xl text-center border border-border-default">
          <p className="text-text-secondary mb-3">You must be logged in to post a comment.</p>
          <a href="/login">
            <Button variant="secondary" size="sm">Login to Comment</Button>
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-5">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p>No comments yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user?.id === comment.userId;
            const isAdmin = user?.role === "admin";
            
            return (
              <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-bg-surface-secondary/50 transition-colors border border-transparent hover:border-border-default">
                <div className="w-10 h-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold overflow-hidden">
                  {comment.user.profilePictureUrl ? (
                    <img src={comment.user.profilePictureUrl} alt={comment.user.name} className="w-full h-full object-cover" />
                  ) : (
                    comment.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <span className="font-semibold text-text-primary truncate">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-text-muted shrink-0" title={new Date(comment.createdAt).toLocaleString()}>
                      {formatRelativeTime(comment.createdAt)}
                      {comment.updatedAt !== comment.createdAt && " (edited)"}
                    </span>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="w-full p-2 text-sm rounded-lg border border-border-default bg-bg-surface-secondary text-text-primary focus:ring-1 focus:ring-accent focus:border-accent resize-y"
                        rows={2}
                        disabled={editSubmitting}
                      />
                      <div className="flex gap-2 self-end">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => setEditingCommentId(null)}
                          disabled={editSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleEditSubmit(comment.id)}
                          disabled={editSubmitting || !editCommentText.trim()}
                        >
                          {editSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Check className="w-3 h-3 mr-1"/>}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-secondary whitespace-pre-wrap text-sm leading-relaxed">
                      {comment.text}
                    </p>
                  )}
                </div>
                {(isOwner || isAdmin) && editingCommentId !== comment.id && (
                  <div className="flex flex-col gap-1 sm:flex-row">
                    {isOwner && (
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditCommentText(comment.text);
                        }}
                        className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors h-fit"
                        title="Edit comment"
                        aria-label="Edit comment"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors h-fit"
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
