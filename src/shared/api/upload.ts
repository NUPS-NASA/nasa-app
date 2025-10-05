import { apiClient } from './client';
import type { TempUploadItem, UploadCommitRequest, UploadCommitResponse } from '../types/index';

export const stageUploads = (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  return apiClient.request<TempUploadItem[]>('/uploads/prepare', {
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
