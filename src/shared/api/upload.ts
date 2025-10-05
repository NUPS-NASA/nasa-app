import { apiClient } from './client';
import type {
  PreprocessCategory,
  StageUploadsResponse,
  UploadCommitRequest,
  UploadCommitResponse,
} from '../types/index';

type PreprocessFileMap = Partial<Record<PreprocessCategory, File[]>>;

export const stageUploads = (files: File[], preprocess?: PreprocessFileMap) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const preprocessFiles = preprocess ?? {};
  preprocessFiles.dark?.forEach(file => formData.append('dark_files', file));
  preprocessFiles.bias?.forEach(file => formData.append('bias_files', file));
  preprocessFiles.flat?.forEach(file => formData.append('flat_files', file));

  return apiClient.request<StageUploadsResponse>('/uploads/prepare', {
    method: 'POST',
    body: formData,
  });
};

export const commitUploads = (payload: UploadCommitRequest) =>
  apiClient.request<UploadCommitResponse>('/uploads/commit', {
    method: 'POST',
    body: payload,
  });

export const uploadsApi = {
  stageUploads,
  commitUploads,
};
