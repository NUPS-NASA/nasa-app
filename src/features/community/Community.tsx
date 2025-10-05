import React, { useEffect, useMemo, useState } from 'react';

import CommunityComposer from './CommunityComposer';
import {
  useCommunityData,
  COMMUNITY_CATEGORY_VALUES,
  type CommunityTabValue,
} from './useCommunityData';
import PostTile from '../../shared/components/PostTile';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../../shared/utils';
import type { CommunityPostCategory } from '../../shared/types/community';

const CATEGORY_LABELS: Record<CommunityPostCategory, string> = {
  announcements: 'Announcements',
  'project-showcase': 'Project Showcase',
  'astrophoto-gallery': 'Astrophoto Gallery',
  'upload-hall-of-fame': 'Upload Hall of Fame',
};

const TAB_ITEMS: Array<{ label: string; value: CommunityTabValue }> = [
  { label: 'All Discussions', value: 'all' },
  ...COMMUNITY_CATEGORY_VALUES.map(value => ({ label: CATEGORY_LABELS[value], value })),
];

const CATEGORY_OPTIONS = COMMUNITY_CATEGORY_VALUES.map(value => ({
  label: CATEGORY_LABELS[value],
  value,
}));

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CommunityTabValue>('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsComposerOpen(false);
    }
  }, [user]);

  const {
    posts,
    isLoading,
    isFetching,
    error,
    toggleLike,
    addComment,
    createPost,
    isCreatingPost,
    deletePost,
    deleteComment,
  } = useCommunityData(activeTab);

  const tabs = TAB_ITEMS;
  const categoryOptions = CATEGORY_OPTIONS;

  const handleToggleLiked = (postId: number, liked: boolean) => {
    toggleLike(postId, liked);
  };

  const handleAddComment = async (postId: number, content: string) => {
    try {
      await addComment(postId, content);
    } catch (mutationError) {
      console.error('Failed to add comment:', mutationError);
    }
  };

  const handleDeletePost = (postId: number) => deletePost(postId);

  const handleDeleteComment = (postId: number, commentId: number) =>
    deleteComment(postId, commentId);

  const showLoading = isLoading || isFetching;
  const defaultComposerCategory = useMemo(() => {
    if (activeTab === 'all') {
      return COMMUNITY_CATEGORY_VALUES[0];
    }

    return activeTab;
  }, [activeTab]);

  const showComposer = Boolean(user) && isComposerOpen;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-sky-50 to-white px-8 py-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold text-slate-900">Mission Control Community</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Swap discoveries, showcase telescope time-lapses, and gather feedback from fellow observers.
            Link your mission projects to build context around every update.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-2xl" />
      </section>

      <nav className="mt-10 flex flex-wrap gap-3">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'rounded-full border px-5 py-2 text-sm font-medium transition-all duration-150',
              activeTab === tab.value
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
            )}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 space-y-6">
        {user ? (
          showComposer ? (
            <CommunityComposer
              categories={categoryOptions}
              defaultCategory={defaultComposerCategory}
              onSubmit={createPost}
              onCancel={() => {
                setIsComposerOpen(false);
              }}
              onSubmitted={() => {
                setIsComposerOpen(false);
              }}
              isSubmitting={isCreatingPost}
            />
          ) : (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-primary/30 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-900">새 게시글 작성</h2>
                <p className="text-sm text-slate-500">
                  소식을 공유하거나 질문을 남겨보세요. 카테고리를 선택해 다른 동료들이 더 쉽게 찾아볼 수 있어요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
              >
                글 작성
              </button>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-5 text-sm text-slate-500">
            로그인 후 커뮤니티에 글이나 댓글을 남길 수 있습니다.
          </div>
        )}

        {showLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-sm text-red-600">
            커뮤니티 게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            아직 게시된 커뮤니티 글이 없습니다. 첫 미션 업데이트를 공유해 보세요!
          </div>
        ) : (
          posts.map(post => (
            <PostTile
              key={post.id}
              post={post}
              onToggleLiked={handleToggleLiked}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
              onDeleteComment={handleDeleteComment}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Community;