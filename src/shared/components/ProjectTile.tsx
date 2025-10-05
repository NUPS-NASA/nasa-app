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
  onTogglePinned?: (projectId: number, nextPinned: boolean) => void;
}

const ProjectTile: FC<ProjectTileProps> = ({
  project,
  pinned = false,
  showActions = false,
  onTogglePinned,
}) => {
  const image = useMemo(() => getPlanetImage(project.id), [project.id]);
  const tags = project.tags ?? [];
  const canTogglePinned = showActions && typeof onTogglePinned === 'function';

  const handleTogglePinned = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canTogglePinned || !onTogglePinned) {
      return;
    }

    onTogglePinned(project.id, !pinned);
  };

  return (
    <Tile variant="button" className="h-[111px]">
      <div className="w-[87px] h-[87px] mr-[12px] flex items-center justify-center">
        <img src={image} alt="" className="w-full h-full object-contain" />
      </div>
      <div className="mr-[4px] flex-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <div className="text-title16 text-black h-[19px] mb-[4px]" title={project.name}>
            {project.name}
          </div>
          {project.description ? (
            <div className="text-body12 text-gray-500 mb-[2px]" title={project.description}>
              {project.description}
            </div>
          ) : (
            <div className="text-body12 text-gray-400 mb-[2px]">No description provided.</div>
          )}
          <div className="text-body10 text-gray-400 h-[12px]">
            {project.members_count ?? 0} {project.members_count === 1 ? 'member' : 'members'}
          </div>
        </div>
        {tags.length > 0 && (
          <div className="flex gap-[5px] flex-wrap">
            {tags.slice(0, 3).map(tag => (
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
