import { type FC, type MouseEvent, useMemo } from 'react';
import { Pin, EllipsisVertical } from 'lucide-react';

import type { ProjectRead } from '../types';
import Button from '../ui/Button';
import { cn } from '../utils';
import Tile from './Tile';

const planetImages = [
  '/svg/planet-placeholder-pink.svg',
  '/svg/planet-placeholder-blue.svg',
  '/svg/planet-placeholder-mint.svg',
  '/svg/planet-placeholder-yellow.svg',
];

const getPlanetImage = (projectId: number) => {
  const index = Math.abs(projectId) % planetImages.length;
  return planetImages[index];
};

interface ProjectTileProps {
  project: ProjectRead;
  pinned?: boolean;
  showActions?: boolean;
  size?: 'default' | 'compact';
  onTogglePinned?: (projectId: number, nextPinned: boolean) => void;
}

const ProjectTile: FC<ProjectTileProps> = ({
  project,
  pinned = false,
  showActions = false,
  size = 'default',
  onTogglePinned,
}) => {
  const image = useMemo(() => getPlanetImage(project.id), [project.id]);
  const tags = project.tags ?? [];
  const canTogglePinned = showActions && typeof onTogglePinned === 'function';
  const isCompact = size === 'compact';

  const handleTogglePinned = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canTogglePinned || !onTogglePinned) {
      return;
    }

    onTogglePinned(project.id, !pinned);
  };

  return (
    <Tile
      variant={isCompact ? 'card' : 'button'}
      className={cn(
        isCompact
          ? 'cursor-default gap-4 p-4 md:flex-row md:items-center flex-col md:p-5'
          : 'h-[111px]'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center shrink-0 rounded-xl bg-slate-50',
          isCompact
            ? 'w-16 h-16 md:mr-4'
            : 'w-[87px] h-[87px] mr-[12px]'
        )}
      >
        <img src={image} alt="" className="w-full h-full object-contain" />
      </div>
      <div
        className={cn(
          'flex-1 flex flex-col justify-between w-full',
          isCompact ? 'gap-3 text-left' : 'mr-[4px]'
        )}
      >
        <div className="flex flex-col">
          <div
            className={cn(
              'text-black',
              isCompact ? 'text-base font-semibold mb-1' : 'text-title16 h-[19px] mb-[4px]'
            )}
            title={project.name}
          >
            {project.name}
          </div>
          {project.description ? (
            <div
              className={cn(
                'text-gray-500',
                isCompact ? 'text-sm leading-snug' : 'text-body12 mb-[2px]'
              )}
              title={project.description}
            >
              {project.description}
            </div>
          ) : (
            <div className="text-body12 text-gray-400 mb-[2px]">No description provided.</div>
          )}
          <div className={cn('text-gray-400', isCompact ? 'text-xs' : 'text-body10 h-[12px]')}>
            {project.members_count ?? 0} {project.members_count === 1 ? 'member' : 'members'}
          </div>
        </div>
        {tags.length > 0 && (
          <div className={cn('flex flex-wrap gap-[5px]', isCompact ? 'mt-1' : '')}>
            {tags.slice(0, isCompact ? 2 : 3).map(tag => (
              <Button key={tag} variant="tag">
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>
      {showActions ? (
        <div className="flex items-start gap-[8px] text-gray-400">
          <Pin
            role="button"
            aria-label={pinned ? 'Unpin project' : 'Pin project'}
            aria-pressed={pinned}
            className={cn(
              'w-[16px] h-[16px]',
              pinned ? 'fill-red-500 text-red-500' : '',
              canTogglePinned ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
            )}
            onClick={handleTogglePinned}
          />

          <EllipsisVertical className="w-[14px] h-[14px]" />
        </div>
      ) : null}
    </Tile>
  );
};

export default ProjectTile;
