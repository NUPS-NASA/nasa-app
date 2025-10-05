import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import {
  addCommunityComment,
  createCommunityPost,
  deleteCommunityComment,
  deleteCommunityPost,
  likeCommunityPost,
  listCommunityPosts,
  unlikeCommunityPost,
} from '../../shared/api/community';
import type {
  CommunityCommentRead,
  CommunityPostCategory,
  CommunityPostCreate,
  CommunityPostLikeStatus,
  CommunityPostRead,
} from '../../shared/types/community';
import type { Post } from '../../shared/types/post';

export type CommunityTabValue = 'all' | CommunityPostCategory;

const COMMUNITY_POSTS_QUERY_KEY = ['community', 'posts'] as const;

export const COMMUNITY_CATEGORY_VALUES: readonly CommunityPostCategory[] = [
  'announcements',
  'project-showcase',
  'astrophoto-gallery',
  'upload-hall-of-fame',
] as const;

const toUiComment = (comment: CommunityCommentRead): Post['comments'][number] => ({
  id: comment.id,
  author: comment.author.display_name,
  authorId: comment.author.id,
  content: comment.content,
  createdAt: comment.created_at,
});

const toUiPost = (post: CommunityPostRead): Post => ({
  id: post.id,
  title: post.title,
  content: post.content,
  author: post.author.display_name,
  authorId: post.author.id,
  authorAvatarUrl: post.author.avatar_url,
  category: post.category,
  likes: post.likes_count,
  liked: post.liked,
  createdAt: post.created_at,
  comments: post.comments.map(toUiComment),
  linkedProject: post.linked_project ?? undefined,
  canDelete: post.can_delete,
});

const updatePostLikeState = (queryClient: QueryClient, status: CommunityPostLikeStatus) => {
  queryClient.setQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY }, posts => {
    if (!posts) {
      return posts;
    }

    return posts.map(post =>
      post.id === status.post_id
        ? {
            ...post,
            liked: status.liked,
            likes: status.likes_count,
          }
        : post,
    );
  });
};

const appendCommentToPost = (
  queryClient: QueryClient,
  postId: number,
  comment: CommunityCommentRead,
) => {
  const uiComment = toUiComment(comment);
  queryClient.setQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY }, posts => {
    if (!posts) {
      return posts;
    }

    return posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [...post.comments, uiComment],
          }
        : post,
    );
  });
};

type PostsCacheSnapshot = {
  previous: Array<[readonly unknown[], Post[] | undefined]>;
};

export const useCommunityData = (category: CommunityTabValue) => {
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: [...COMMUNITY_POSTS_QUERY_KEY, category],
    queryFn: async () => {
      const posts = await listCommunityPosts({ category });
      return posts.map(toUiPost);
    },
  });

  const toggleLikeMutation = useMutation<
    CommunityPostLikeStatus,
    unknown,
    { postId: number; like: boolean },
    PostsCacheSnapshot
  >({
    mutationFn: async ({ postId, like }) =>
      like ? likeCommunityPost(postId) : unlikeCommunityPost(postId),
    onMutate: async ({ postId, like }) => {
      await queryClient.cancelQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
      const previous = queryClient.getQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY });

      queryClient.setQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY }, posts => {
        if (!posts) {
          return posts;
        }

        return posts.map(post => {
          if (post.id !== postId) {
            return post;
          }

          const nextLikes = like ? post.likes + 1 : Math.max(0, post.likes - 1);
          return {
            ...post,
            liked: like,
            likes: nextLikes,
          };
        });
      });

      return { previous } satisfies PostsCacheSnapshot;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      context.previous.forEach(([key, data]) => {
        queryClient.setQueryData<Post[] | undefined>(key, data);
      });
    },
    onSuccess: status => {
      updatePostLikeState(queryClient, status);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      addCommunityComment(postId, { content }),
    onSuccess: (comment, { postId }) => {
      appendCommentToPost(queryClient, postId, comment);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
    },
  });

  const deleteCommentMutation = useMutation<
    void,
    unknown,
    { postId: number; commentId: number },
    PostsCacheSnapshot
  >({
    mutationFn: ({ postId, commentId }: { postId: number; commentId: number }) =>
      deleteCommunityComment(postId, commentId),
    onMutate: async variables => {
      await queryClient.cancelQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
      const previous = queryClient.getQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY });

      queryClient.setQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY }, posts => {
        if (!posts) {
          return posts;
        }

        return posts.map(post =>
          post.id === variables.postId
            ? {
                ...post,
                comments: post.comments.filter(comment => comment.id !== variables.commentId),
              }
            : post,
        );
      });

      return { previous } satisfies PostsCacheSnapshot;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      context.previous.forEach(([key, data]) => {
        queryClient.setQueryData<Post[] | undefined>(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
    },
  });

  const deletePostMutation = useMutation<void, unknown, number, PostsCacheSnapshot>({
    mutationFn: (postId: number) => deleteCommunityPost(postId),
    onMutate: async postId => {
      await queryClient.cancelQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
      const previous = queryClient.getQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY });

      queryClient.setQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY }, posts => {
        if (!posts) {
          return posts;
        }

        return posts.filter(post => post.id !== postId);
      });

      return { previous } satisfies PostsCacheSnapshot;
    },
    onError: (_error, _postId, context) => {
      if (!context) {
        return;
      }

      context.previous.forEach(([key, data]) => {
        queryClient.setQueryData<Post[] | undefined>(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (payload: CommunityPostCreate) => createCommunityPost(payload),
    onSuccess: post => {
      const uiPost = toUiPost(post);

      queryClient.setQueryData<Post[] | undefined>(
        [...COMMUNITY_POSTS_QUERY_KEY, 'all'],
        existing => (existing ? [uiPost, ...existing] : [uiPost]),
      );

      queryClient.setQueryData<Post[] | undefined>(
        [...COMMUNITY_POSTS_QUERY_KEY, post.category],
        existing => (existing ? [uiPost, ...existing] : [uiPost]),
      );

      queryClient.setQueriesData<Post[]>({ queryKey: COMMUNITY_POSTS_QUERY_KEY }, posts => {
        if (!posts) {
          return posts;
        }

        return posts.some(item => item.id === uiPost.id) ? posts : [uiPost, ...posts];
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_POSTS_QUERY_KEY });
    },
  });

  return {
    posts: postsQuery.data ?? [],
    isLoading: postsQuery.isLoading,
    isFetching: postsQuery.isFetching,
    error: postsQuery.error,
    refetch: postsQuery.refetch,
    toggleLike: (postId: number, like: boolean) => toggleLikeMutation.mutate({ postId, like }),
    addComment: (postId: number, content: string) => addCommentMutation.mutateAsync({ postId, content }),
    deleteComment: (postId: number, commentId: number) =>
      deleteCommentMutation.mutateAsync({ postId, commentId }),
    createPost: (payload: CommunityPostCreate) => createPostMutation.mutateAsync(payload),
    deletePost: (postId: number) => deletePostMutation.mutateAsync(postId),
    isTogglingLike: toggleLikeMutation.isPending,
    isAddingComment: addCommentMutation.isPending,
    isCreatingPost: createPostMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isDeletingPost: deletePostMutation.isPending,
  };
};