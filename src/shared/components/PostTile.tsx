import { type FC, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Heart, MessageCircle, Send } from 'lucide-react';

import type { Post } from '../types/post';
import Button from '../ui/Button';
import { cn } from '../utils';
import ProjectTile from './ProjectTile';

interface PostTileProps {
  post: Post;
  onToggleLiked?: (postId: number, nextLiked: boolean) => void;
  onAddComment?: (postId: number, commentContent: string) => void;
}

const PostTile: FC<PostTileProps> = ({ post, onToggleLiked, onAddComment }) => {
  const [commentContent, setCommentContent] = useState('');
  const [showComments, setShowComments] = useState(post.comments.length > 0);

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

  const handleAddComment = () => {
    const content = commentContent.trim();
    if (!content) {
      return;
    }

    onAddComment?.(post.id, content);
    setCommentContent('');
    setShowComments(true);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold uppercase text-primary">
            {post.author.slice(0, 2).toUpperCase()}
          </div>
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

      <section className="px-6 pb-5 text-base leading-relaxed text-slate-700 whitespace-pre-line">
        <h3 className="mb-3 text-xl font-semibold text-slate-900">{post.title}</h3>
        {post.content}
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
                  <time
                    className="ml-auto text-xs text-slate-500"
                    dateTime={comment.createdAt}
                  >
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </time>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Be the first to start a discussion on this post.
              </p>
            )}
          </div>
        )}

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
                handleAddComment();
              }
            }}
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <p className="text-xs text-slate-500">
              Press <span className="font-medium">Ctrl/⌘ + Enter</span> to post
            </p>
            <Button
              variant="primary"
              className="flex items-center gap-2 px-4 py-2"
              onClick={handleAddComment}
              disabled={!commentContent.trim()}
              type="button"
            >
              <Send className="h-4 w-4" />
              <span>Post comment</span>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
};

export default PostTile;