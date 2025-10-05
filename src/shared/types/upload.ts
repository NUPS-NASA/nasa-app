import type { DataRead, DatasetRead } from './dataset';
import type { RepositoryRead } from './repository';
import type { SessionRead } from './session';

export interface TempUploadItem {
  temp_id: string;
  filename: string;
  size_bytes: number;
  content_type?: string | null;
  tmp_fits: string;
  tmp_png?: string | null;
  fits_header?: Record<string, string> | null;
  metadata_json?: Record<string, string> | null;
}

export interface UploadCommitItem {
  temp_id: string;
  fits_temp_path: string;
  image_temp_path?: string | null;
  fits_data_json?: Record<string, string> | null;
  metadata_json?: Record<string, string> | null;
}

export interface UploadCommitRequest {
  user_id: number;
  repository_name: string;
  repository_description?: string | null;
  captured_at?: string | null;
  items: UploadCommitItem[];
}

export interface UploadCommitResponse {
  repository: RepositoryRead;
  dataset: DatasetRead;
  data: DataRead[];
  sessions: SessionRead[];
}
