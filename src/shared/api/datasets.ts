import { apiClient } from './client';
import type { DataCreate, DataRead, DatasetCreate, DatasetRead } from '../types';

export const listDatasets = (repositoryId: number) =>
  apiClient.request<DatasetRead[]>('/datasets', {
    query: { repository_id: repositoryId },
  });

export const createDataset = (payload: DatasetCreate) =>
  apiClient.request<DatasetRead>('/datasets', {
    method: 'POST',
    body: payload,
  });

export const listDataItems = (datasetId: number) =>
  apiClient.request<DataRead[]>('/data', {
    query: { dataset_id: datasetId },
  });

export const createDataItem = (payload: DataCreate) =>
  apiClient.request<DataRead>('/data', {
    method: 'POST',
    body: payload,
  });

export const datasetsApi = {
  listDatasets,
  createDataset,
  listDataItems,
  createDataItem,
};
