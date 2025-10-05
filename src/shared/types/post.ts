import type { ProjectRead } from './project';

export interface Comment {
  id: number;
  author: string;
  authorId?: number;
  content: string;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorId?: number;
  authorAvatarUrl?: string | null;
  category: 'announcements' | 'project-showcase' | 'astrophoto-gallery' | 'upload-hall-of-fame';
  likes: number;
  liked: boolean;
  comments: Comment[];
  createdAt: string;
  linkedProject?: ProjectRead;
  canDelete?: boolean;
}