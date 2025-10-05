import { EllipsisVertical, Star } from 'lucide-react';
import { type FC, type MouseEvent, useMemo } from 'react';

import type { RepositoryRead } from '../types';
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

  const createdAtLabel = useMemo(() => {
    try {
      const createdAt = new Date(repository.created_at);
      const year = createdAt.getFullYear();
      const month = String(createdAt.getMonth() + 1).padStart(2, '0');
      const day = String(createdAt.getDate()).padStart(2, '0');
      const hours = String(createdAt.getHours()).padStart(2, '0');
      const minutes = String(createdAt.getMinutes()).padStart(2, '0');

      const offsetInMinutes = -createdAt.getTimezoneOffset();
      const offsetSign = offsetInMinutes >= 0 ? '+' : '-';
      const absoluteOffsetMinutes = Math.abs(offsetInMinutes);
      const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(2, '0');
      const offsetMinutes = String(absoluteOffsetMinutes % 60).padStart(2, '0');
      const offsetLabel =
        offsetMinutes === '00'
          ? `GMT${offsetSign}${offsetHours}`
          : `GMT${offsetSign}${offsetHours}:${offsetMinutes}`;

      return `Upload: ${year}/${month}/${day} ${hours}:${minutes} (${offsetLabel})`;
    } catch (error) {
      return null;
    }
  }, [repository.created_at]);

  const sessionHeadline = useMemo(() => {
    if (!repository.session) {
      return null;
    }

    const { current_step: currentStep, status } = repository.session;

    if (currentStep) {
      const trimmed = currentStep.trim();
      if (trimmed.length > 0) {
        const hasEllipsis = /\u2026|\.\.\.$/.test(trimmed);
        return `${trimmed}${hasEllipsis ? '' : '…'}`;
      }
    }

    if (status) {
      const trimmedStatus = status.trim();
      if (trimmedStatus.length > 0) {
        return `${trimmedStatus.charAt(0).toUpperCase()}${trimmedStatus.slice(1)}`;
      }
    }

    return 'Processing…';
  }, [repository.session]);

  const sessionDetails = useMemo(() => {
    if (!repository.session) {
      return null;
    }

    const parts: string[] = [];
    if (repository.session.status) {
      const trimmed = repository.session.status.trim();
      if (trimmed.length > 0) {
        parts.push(`Status: ${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`);
      }
    }
    if (repository.session.current_step) {
      const trimmed = repository.session.current_step.trim();
      if (trimmed.length > 0) {
        parts.push(`Step: ${trimmed}`);
      }
    }

    if (parts.length === 0) {
      return null;
    }

    return parts.join(' • ');
  }, [repository.session]);

  const progress = useMemo(() => {
    if (!repository.session || typeof repository.session.progress !== 'number') {
      return null;
    }

    const value = Math.round(repository.session.progress);
    return Math.min(100, Math.max(0, value));
  }, [repository.session]);

  const handleToggleStar = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canToggleStar || !onToggleStarred) {
      return;
    }
    onToggleStarred(repository.id, !isStarred);
  };

  return (
    <Tile variant="button" className="flex-col gap-[12px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <div className="text-title16 text-black" title={repository.name}>
            <span className="truncate block">{repository.name}</span>
          </div>
          {createdAtLabel ? (
            <div className="text-body12 text-gray-500">{createdAtLabel}</div>
          ) : (
            <div className="text-body12 text-gray-400">Creation date unavailable</div>
          )}
          <div className="text-body12 text-gray-500">Uploaded by User #{repository.user_id}</div>
          {repository.description ? (
            <div className="text-body12 text-gray-600 truncate" title={repository.description}>
              {repository.description}
            </div>
          ) : null}
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
      </div>
      {sessionHeadline || progress !== null || sessionDetails ? (
        <div className="flex flex-col gap-[6px]">
          {sessionHeadline ? (
            <div className="flex items-center justify-between text-body12 text-gray-600">
              <span className="truncate" title={sessionHeadline}>
                {sessionHeadline}
              </span>
              {progress !== null ? <span>{progress}%</span> : null}
            </div>
          ) : null}
          {progress !== null ? (
            <div className="h-[6px] w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
          {sessionDetails ? (
            <div className="text-body10 text-gray-400" title={sessionDetails}>
              <span className="truncate block">{sessionDetails}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </Tile>
  );
};

export default UploadTile;
