import { EllipsisVertical, Star } from 'lucide-react';
import { type FC, type MouseEvent, useMemo } from 'react';

import type { RepositoryRead } from '../types';
import Button from '../ui/Button';
import { cn } from '../utils';
import Tile from './Tile';

interface UploadTileProps {
  repository: RepositoryRead;
  starred?: boolean;
  showActions?: boolean;
  onToggleStarred?: (repositoryId: number, nextStarred: boolean) => void;
}

const UploadTile: FC<UploadTileProps> = ({
  repository,
  starred,
  showActions = false,
  onToggleStarred,
}) => {
  const isStarred = starred ?? repository.starred ?? false;
  const canToggleStar = showActions && typeof onToggleStarred === 'function';

  const latestStatus = useMemo(() => {
    if (!repository.session) {
      return null;
    }
    const parts: string[] = [];
    if (repository.session.status) {
      parts.push(repository.session.status);
    }
    if (repository.session.current_step) {
      parts.push(`step: ${repository.session.current_step}`);
    }
    if (parts.length === 0) {
      return null;
    }
    return parts.join(' • ');
  }, [repository.session]);

  const createdAt = useMemo(() => {
    try {
      return new Date(repository.created_at).toLocaleDateString();
    } catch (error) {
      return null;
    }
  }, [repository.created_at]);

  const handleToggleStar = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canToggleStar || !onToggleStarred) {
      return;
    }
    onToggleStarred(repository.id, !isStarred);
  };

  return (
    <Tile variant="button" className="h-[111px]">
      <div className="mr-[4px] flex-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <div className="text-title16 text-black h-[19px] mb-[4px]" title={repository.name}>
            {repository.name}
          </div>
          {repository.description ? (
            <div className="text-body12 text-gray-500 mb-[2px]" title={repository.description}>
              {repository.description}
            </div>
          ) : (
            <div className="text-body12 text-gray-400 mb-[2px]">No description provided.</div>
          )}
          <div className="text-body10 text-gray-400 h-[12px]">
            {createdAt ? `Created ${createdAt}` : 'Creation date unavailable'}
          </div>
        </div>
        <div className="flex gap-[5px] flex-wrap"></div>
      </div>
      {showActions ? (
        <div className="flex items-start gap-[8px] text-gray-400">
          <Star
            role="button"
            aria-label={isStarred ? 'Unstar upload' : 'Star upload'}
            aria-pressed={isStarred}
            className={cn(
              'w-[14.33px] h-[13.71px]',
              isStarred ? 'fill-yellow-300 text-yellow-400' : '',
              canToggleStar ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
            )}
            onClick={handleToggleStar}
          />
          <EllipsisVertical className="w-[14px] h-[14px]" />
        </div>
      ) : null}
    </Tile>
  );
};

export default UploadTile;
