import type { DataRead, DatasetRead } from './dataset';
import type { RepositoryRead } from './repository';
import type { SessionRead } from './session';

export type PreprocessCategory = 'dark' | 'bias' | 'flat';

export interface TempUploadItem {
  temp_id: string;
  filename: string;
  size_bytes: number;
  content_type?: string | null;
  tmp_fits: string;
  tmp_png?: string | null;
  fits_header?: Record<string, unknown> | null;
  metadata_json?: Record<string, unknown> | null;
}

export interface TempPreprocessItem {
  temp_id: string;
  category: PreprocessCategory;
  filename: string;
  size_bytes: number;
  temp_path: string;
  tmp_png?: string | null;
  metadata_json?: Record<string, unknown> | null;
}

export interface StageUploadsResponse {
  items: TempUploadItem[];
  preprocess: Partial<Record<PreprocessCategory, TempPreprocessItem[]>>;
}

export interface UploadCommitItem {
  temp_id: string;
  fits_temp_path: string;
  image_temp_path?: string | null;
  fits_data_json?: Record<string, unknown> | null;
  metadata_json?: Record<string, unknown> | null;
}

export interface UploadPreprocessCommitItem {
  temp_id: string;
  category: PreprocessCategory;
  temp_path: string;
  original_name?: string | null;
  metadata_json?: Record<string, unknown> | null;
}

export interface UploadCommitRequest {
  user_id: number;
  repository_name: string;
  repository_description?: string | null;
  captured_at?: string | null;
  items: UploadCommitItem[];
  preprocess_items?: UploadPreprocessCommitItem[] | null;
}

export interface UploadCommitResponse {
  repository: RepositoryRead;
  dataset: DatasetRead;
  data: DataRead[];
  preprocess_data: DataRead[];
  sessions: SessionRead[];
}
