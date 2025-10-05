import { apiClient } from './client';
import type {
  CommunityCommentCreate,
  CommunityCommentRead,
  CommunityPostCategory,
  CommunityPostCreate,
  CommunityPostLikeStatus,
  CommunityPostRead,
} from '../types/community';

export interface ListCommunityPostsParams {
  category?: CommunityPostCategory | 'all';
}

export const listCommunityPosts = (params: ListCommunityPostsParams = {}) => {
  const category = params.category && params.category !== 'all' ? params.category : undefined;
  return apiClient.request<CommunityPostRead[]>('/community/posts', {
    query: category ? { category } : undefined,
  });
};

export const addCommunityComment = (postId: number, payload: CommunityCommentCreate) =>
  apiClient.request<CommunityCommentRead>(`/community/posts/${postId}/comments`, {
    method: 'POST',
    body: payload,
  });

export const createCommunityPost = (payload: CommunityPostCreate) =>
  apiClient.request<CommunityPostRead>('/community/posts', {
    method: 'POST',
    body: payload,
  });

export const likeCommunityPost = (postId: number) =>
  apiClient.request<CommunityPostLikeStatus>(`/community/posts/${postId}/likes`, {
    method: 'POST',
  });

export const unlikeCommunityPost = (postId: number) =>
  apiClient.request<CommunityPostLikeStatus>(`/community/posts/${postId}/likes`, {
    method: 'DELETE',
  });

export const deleteCommunityComment = (postId: number, commentId: number) =>
  apiClient
    .request<null>(`/community/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    })
    .then(() => undefined);

export const deleteCommunityPost = (postId: number) =>
  apiClient
    .request<null>(`/community/posts/${postId}`, {
      method: 'DELETE',
    })
    .then(() => undefined);

export const communityApi = {
  listCommunityPosts,
  addCommunityComment,
  createCommunityPost,
  likeCommunityPost,
  unlikeCommunityPost,
  deleteCommunityComment,
  deleteCommunityPost,
};
