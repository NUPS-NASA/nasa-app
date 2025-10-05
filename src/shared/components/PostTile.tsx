import { type FC, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Heart, MessageCircle, Send, Trash2 } from 'lucide-react';

import type { Post } from '../types/post';
import Button from '../ui/Button';
import { cn } from '../utils';
import ProjectTile from './ProjectTile';

interface PostTileProps {
  post: Post;
  onToggleLiked?: (postId: number, nextLiked: boolean) => void;
  onAddComment?: (postId: number, commentContent: string) => void | Promise<void>;
  onDeletePost?: (postId: number) => void | Promise<void>;
  onDeleteComment?: (postId: number, commentId: number) => void | Promise<void>;
  currentUserId?: number;
}

const PostTile: FC<PostTileProps> = ({
  post,
  onToggleLiked,
  onAddComment,
  onDeletePost,
  onDeleteComment,
  currentUserId,
}) => {
  const [commentContent, setCommentContent] = useState('');
  const [showComments, setShowComments] = useState(post.comments.length > 0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deletingCommentIds, setDeletingCommentIds] = useState<Set<number>>(() => new Set());

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(post.createdAt));
    } catch (error) {
      return post.createdAt;
    }
  }, [post.createdAt]);

  const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const contentHtml = useMemo(() => {
    if (!post.content) {
      return '';
    }

    const containsHtmlTag = /<[^>]+>/i.test(post.content);

    if (containsHtmlTag) {
      return post.content;
    }

    return escapeHtml(post.content).replace(/\n/g, '<br />');
  }, [post.content]);

  const categoryLabelMap: Record<Post['category'], string> = {
    announcements: 'Announcements',
    'project-showcase': 'Project Showcase',
    'astrophoto-gallery': 'Astrophoto Gallery',
    'upload-hall-of-fame': 'Upload Hall of Fame',
  };

  const commentCountLabel = `${post.comments.length} ${
    post.comments.length === 1 ? 'comment' : 'comments'
  }`;

  const handleToggleLiked = () => {
    onToggleLiked?.(post.id, !post.liked);
  };

  const submitComment = async () => {
    const content = commentContent.trim();
    if (!content || !onAddComment) {
      return;
    }

    setIsSubmittingComment(true);
    try {
      await Promise.resolve(onAddComment(post.id, content));
      setCommentContent('');
      setShowComments(true);
    } catch (error) {
      console.error('Failed to add comment', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post.canDelete || !onDeletePost) {
      return;
    }

    const confirmed = window.confirm('게시글을 삭제하시겠어요? 삭제 후에는 되돌릴 수 없습니다.');
    if (!confirmed) {
      return;
    }

    setIsDeletingPost(true);
    try {
      await Promise.resolve(onDeletePost(post.id));
    } catch (error) {
      console.error('Failed to delete post', error);
      window.alert('게시글 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!onDeleteComment) {
      return;
    }

    const confirmed = window.confirm('이 댓글을 삭제하시겠어요? 삭제 후에는 복구할 수 없습니다.');
    if (!confirmed) {
      return;
    }

    setDeletingCommentIds(prev => {
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });

    try {
      await Promise.resolve(onDeleteComment(post.id, commentId));
      setDeletingCommentIds(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    } catch (error) {
      console.error('Failed to delete comment', error);
      window.alert('댓글 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setDeletingCommentIds(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div className="flex items-start gap-4">
          {post.authorAvatarUrl && false ? (
            <img
              src={post.authorAvatarUrl || undefined}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold uppercase text-primary">
              {post.author.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{post.author}</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                {categoryLabelMap[post.category]}
              </span>
            </div>
            <time className="block text-xs text-slate-500" dateTime={post.createdAt}>
              {formattedDate}
            </time>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {post.canDelete ? (
            <button
              type="button"
              onClick={handleDeletePost}
              className="flex items-center gap-2 rounded-full border border-transparent bg-slate-50 px-4 py-2 text-sm font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50"
              disabled={isDeletingPost}
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeletingPost ? '삭제 중...' : '삭제'}</span>
            </button>
          ) : null}
          <button
            onClick={handleToggleLiked}
            className={cn(
              'flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium transition-colors',
              post.liked
                ? 'bg-red-50 text-red-500 border-red-100'
                : 'bg-slate-50 text-slate-600 hover:border-red-200 hover:text-red-500'
            )}
            aria-pressed={post.liked}
            aria-label={post.liked ? 'Unlike post' : 'Like post'}
            type="button"
          >
            <Heart className={cn('h-4 w-4', post.liked ? 'fill-current' : '')} />
            <span>{post.likes}</span>
          </button>

          <button
            onClick={() => setShowComments(prev => !prev)}
            className="flex items-center gap-2 rounded-full border border-transparent bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-200 hover:text-slate-700"
            type="button"
            aria-expanded={showComments}
            aria-controls={`post-${post.id}-comments`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentCountLabel}</span>
            {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <section className="px-6 pb-5 text-base leading-relaxed text-slate-700">
        <h3 className="mb-3 text-xl font-semibold text-slate-900">{post.title}</h3>
        <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </section>

      {post.linkedProject ? (
        <section className="border-t border-slate-100 bg-slate-50 px-6 py-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Linked project
          </h4>
          <ProjectTile project={post.linkedProject} showActions={false} size="compact" />
        </section>
      ) : null}

      <section
        id={`post-${post.id}-comments`}
        className="border-t border-slate-200 px-6 py-5"
        aria-live="polite"
      >
        {showComments && (
          <div className="space-y-3">
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <div
                  key={comment.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                >
                  <p className="font-semibold text-slate-800">{comment.author}</p>
                  <span className="text-slate-300">•</span>
                  <p className="text-slate-700">{comment.content}</p>
                  <div className="ml-auto flex items-center gap-3">
                    <time
                      className="text-xs text-slate-500"
                      dateTime={comment.createdAt}
                    >
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </time>
                    {currentUserId && comment.authorId === currentUserId && onDeleteComment ? (
                      <button
                        type="button"
                        onClick={() => void handleDeleteComment(comment.id)}
                        className="flex items-center gap-1 text-xs font-medium text-red-500 transition hover:text-red-600 disabled:opacity-60"
                        disabled={deletingCommentIds.has(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>
                          {deletingCommentIds.has(comment.id) ? '삭제 중...' : '삭제'}
                        </span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Be the first to start a discussion on this post.
              </p>
            )}
          </div>
        )}

        {currentUserId ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label htmlFor={`post-${post.id}-comment-input`} className="sr-only">
              Add a comment
            </label>
            <textarea
              id={`post-${post.id}-comment-input`}
              rows={3}
              value={commentContent}
              onChange={event => setCommentContent(event.target.value)}
              placeholder="Share your feedback or ask a question..."
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={event => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  void submitComment();
                }
              }}
              disabled={isSubmittingComment}
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <p className="text-xs text-slate-500">
                Press <span className="font-medium">Ctrl/⌘ + Enter</span> to post
              </p>
              <Button
                variant="primary"
                className="flex items-center gap-2 px-4 py-2"
                onClick={() => void submitComment()}
                disabled={isSubmittingComment || !commentContent.trim()}
                type="button"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmittingComment ? 'Posting...' : 'Post comment'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            로그인 후 댓글을 남길 수 있습니다.
          </div>
        )}
      </section>
    </article>
  );
};

export default PostTile;