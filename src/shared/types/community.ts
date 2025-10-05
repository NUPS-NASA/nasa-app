import type { ProjectRead } from './project';

export type CommunityPostCategory =
  | 'announcements'
  | 'project-showcase'
  | 'astrophoto-gallery'
  | 'upload-hall-of-fame';

export interface CommunityUserSummary {
  id: number;
  display_name: string;
  avatar_url: string | null;
}

export interface CommunityCommentCreate {
  content: string;
}

export interface CommunityCommentRead {
  id: number;
  content: string;
  created_at: string;
  author: CommunityUserSummary;
}

export interface CommunityPostRead {
  id: number;
  title: string;
  content: string;
  category: CommunityPostCategory;
  created_at: string;
  updated_at: string;
  author: CommunityUserSummary;
  likes_count: number;
  liked: boolean;
  comments: CommunityCommentRead[];
  linked_project: ProjectRead | null;
  can_delete?: boolean;
}

export interface CommunityPostLikeStatus {
  post_id: number;
  liked: boolean;
  likes_count: number;
}

export interface CommunityPostCreate {
  title: string;
  content: string;
  category: CommunityPostCategory;
  linked_project_id?: number | null;
}
