export interface TempUploadItem {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  created_at: string;
  checksum?: string;
}

export interface UploadCommitRequest {
  repository_id: number;
  items: string[];
  session_name?: string;
  metadata?: Record<string, any>;
}

export interface UploadCommitResponse {
  session_id: string;
  repository_id: number;
  committed_count: number;
  message?: string;
}
