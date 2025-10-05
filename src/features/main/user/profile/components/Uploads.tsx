import { type FC, useMemo } from 'react';

import UploadTile from '../../../../../shared/components/UploadTile';
import { TileList } from '../../../../../shared/components/TileList';
import type { RepositoryRead } from '../../../../../shared/types';

interface UploadsProps {
  repositories: RepositoryRead[];
  columns?: number;
  starredRepositoryIds?: number[] | Set<number>;
  showActions?: boolean;
  emptyMessage?: string;
  openRepo?: (repository: RepositoryRead) => void;
  onToggleStarred?: (repositoryId: number, nextStarred: boolean) => void;
}

const Uploads: FC<UploadsProps> = ({
  repositories,
  columns = 1,
  starredRepositoryIds,
  showActions = false,
  emptyMessage = 'No uploads to display yet.',
  onToggleStarred,
  openRepo,
}) => {
  const starredIds = useMemo(() => {
    if (!starredRepositoryIds) {
      return new Set<number>();
    }
    return new Set<number>(
      Array.isArray(starredRepositoryIds) ? starredRepositoryIds : Array.from(starredRepositoryIds),
    );
  }, [starredRepositoryIds]);

  if (repositories.length === 0) {
    return <div className="text-body12 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <TileList
      items={repositories}
      columns={columns}
      renderItem={repository => (
        <UploadTile
          key={repository.id}
          openRepo={repo => {
            openRepo?.(repo);
          }}
          repository={repository}
          starred={starredIds.has(repository.id) || repository.starred}
          showActions={showActions}
          onToggleStarred={onToggleStarred}
        />
      )}
    />
  );
};

export default Uploads;
