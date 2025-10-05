import React, { useEffect, useState } from 'react';

import { fetchCommunityPosts } from './useCommunityData';
import PostTile from '../../shared/components/PostTile';
import type { Post } from '../../shared/types/post';
import { cn } from '../../shared/utils';

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | Post['category']>('all');

  const tabs: Array<{ label: string; value: 'all' | Post['category'] }> = [
    { label: 'All Discussions', value: 'all' },
    { label: 'Announcements', value: 'announcements' },
    { label: 'Project Showcase', value: 'project-showcase' },
    { label: 'Astrophoto Gallery', value: 'astrophoto-gallery' },
    { label: 'Upload Hall of Fame', value: 'upload-hall-of-fame' },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);

      try {
  const data = await fetchCommunityPosts(activeTab);

        if (!cancelled) {
          setPosts(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load community posts:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleToggleLiked = (postId: number, liked: boolean) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, liked, likes: liked ? post.likes + 1 : post.likes - 1 }
          : post
      )
    );
  };

  const handleAddComment = (postId: number, content: string) => {
    const newComment = {
      id: Date.now(),
      author: 'Current User', // Mock - replace with actual user
      content,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

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
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
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
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Community;