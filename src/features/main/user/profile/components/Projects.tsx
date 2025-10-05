import { type FC, useMemo } from 'react';

import ProjectTile from '../../../../../shared/components/ProjectTile';
import { TileList } from '../../../../../shared/components/TileList';
import type { ProjectRead } from '../../../../../shared/types';

interface ProjectsProps {
  projects: ProjectRead[];
  columns?: number;
  pinnedProjectIds?: number[] | Set<number>;
  showActions?: boolean;
  emptyMessage?: string;
  onTogglePinned?: (projectId: number, nextPinned: boolean) => void;
}

const Projects: FC<ProjectsProps> = ({
  projects,
  columns = 1,
  pinnedProjectIds,
  showActions = false,
  emptyMessage = 'No projects to display yet.',
  onTogglePinned,
}) => {
  const pinnedIds = useMemo(() => {
    if (!pinnedProjectIds) {
      return new Set<number>();
    }
    return new Set<number>(Array.isArray(pinnedProjectIds) ? pinnedProjectIds : Array.from(pinnedProjectIds));
  }, [pinnedProjectIds]);

  if (projects.length === 0) {
    return <div className="text-body12 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <TileList
      items={projects}
      columns={columns}
      renderItem={project => (
        <ProjectTile
          key={project.id}
          project={project}
          pinned={pinnedIds.has(project.id)}
          showActions={showActions}
          onTogglePinned={onTogglePinned}
        />
      )}
    />
  );
};

export default Projects;
