import { useEffect, useMemo, useState } from 'react';
import { MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Projects from './components/Projects';
import { ApiError } from '../../../../shared/api/client';
import { useAuth } from '../../../auth/AuthContext';
import {
  listPinnedProjects,
  listProjects,
  pinProject,
  unpinProject,
} from '../../../../shared/api/projects';
import { useUserIdParam } from '../../../../shared/hooks/useUserIdParam';
import type { ProjectRead } from '../../../../shared/types';

const UserProjects = () => {
  const userId = useUserIdParam();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projectsResponse, pinnedResponse] = await Promise.all([
          listProjects({ memberId: userId }),
          listPinnedProjects(userId),
        ]);

        if (!active) {
          return;
        }

        setProjects(projectsResponse);
        setPinnedIds(pinnedResponse.map(pin => pin.project_id));
      } catch (err) {
        if (!active) {
          return;
        }

        if (err instanceof ApiError) {
          const detail =
            typeof err.body === 'object' && err.body && 'detail' in (err.body as Record<string, unknown>)
              ? String((err.body as Record<string, unknown>).detail)
              : null;
          setError(detail ?? 'Failed to load projects.');
        } else {
          setError('Failed to load projects.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [userId]);

  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);
  const canManagePins = authUser?.id === userId;

  const handleTogglePinned = async (projectId: number, nextPinned: boolean) => {
    if (!userId || !canManagePins) {
      setError('You need to be the project owner to manage pins.');
      return;
    }

    const previous = new Set(pinnedIds);

    setPinnedIds(prev => {
      const updated = new Set(prev);
      if (nextPinned) {
        updated.add(projectId);
      } else {
        updated.delete(projectId);
      }
      return Array.from(updated);
    });

    try {
      if (nextPinned) {
        await pinProject(userId, { project_id: projectId });
      } else {
        await unpinProject(userId, projectId);
      }
    } catch (err) {
      setPinnedIds(Array.from(previous));

      if (err instanceof ApiError) {
        const detail =
          typeof err.body === 'object' && err.body && 'detail' in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).detail)
            : null;
        setError(detail ?? 'Failed to update pinned projects.');
      } else {
        setError('Failed to update pinned projects.');
      }
    }
  };

  const handleBack = () => {
    if (!userId) {
      return;
    }

    navigate(`/user/${userId}/profile`);
  };

  if (!userId) {
    return (
      <div className="w-full flex justify-center items-center text-body14 text-gray-500 h-full">
        Invalid user identifier.
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-[984px] mt-[40px]">
        <button
          type="button"
          onClick={handleBack}
          className="flex text-title20 items-center gap-[4px] mb-[10px] bg-transparent border-0 p-0 text-left text-black"
        >
          <MoveLeft className="w-[24px] h-[24px]" />
          All My Projects
        </button>
        {error && (
          <div className="text-body12 text-red-500 bg-red-50 border border-red-200 rounded-[8px] p-[10px] mb-[12px]">
            {error}
          </div>
        )}
        <Projects
          projects={projects}
          columns={2}
          pinnedProjectIds={pinnedSet}
          showActions={canManagePins}
          onTogglePinned={handleTogglePinned}
          emptyMessage={loading ? 'Loading projects…' : 'No projects found yet.'}
        />
      </div>
    </div>
  );
};

export default UserProjects;
