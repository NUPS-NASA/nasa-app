import { useEffect, useMemo, useState } from 'react';
import { MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Uploads from './components/Uploads';
import { ApiError } from '../../../../shared/api/client';
import { useAuth } from '../../../auth/AuthContext';
import {
  listRepositories,
  starRepository,
  unstarRepository,
} from '../../../../shared/api/repositories';
import { useUserIdParam } from '../../../../shared/hooks/useUserIdParam';
import type { RepositoryRead } from '../../../../shared/types';

const UserLikedProjects = () => {
  const userId = useUserIdParam();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [likedRepositories, setLikedRepositories] = useState<RepositoryRead[]>([]);
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
        const response = await listRepositories({ starredBy: userId, includeSession: true });
        if (!active) {
          return;
        }
        setLikedRepositories(response);
      } catch (err) {
        if (!active) {
          return;
        }
        if (err instanceof ApiError) {
          const detail =
            typeof err.body === 'object' && err.body && 'detail' in (err.body as Record<string, unknown>)
              ? String((err.body as Record<string, unknown>).detail)
              : null;
          setError(detail ?? 'Failed to load liked projects.');
        } else {
          setError('Failed to load liked projects.');
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

  const likedSet = useMemo(() => new Set(likedRepositories.map(repo => repo.id)), [likedRepositories]);
  const canManageStars = authUser?.id === userId;

  const handleToggleStarred = async (repositoryId: number, nextStarred: boolean) => {
    if (!authUser || !canManageStars) {
      setError('You need to be signed in as this user to manage liked projects.');
      return;
    }

    const previous = likedRepositories;

    setLikedRepositories(prev => {
      if (nextStarred) {
        return prev.map(repository =>
          repository.id === repositoryId ? { ...repository, starred: true } : repository,
        );
      }
      return prev.filter(repository => repository.id !== repositoryId);
    });

    try {
      if (nextStarred) {
        await starRepository(repositoryId, authUser.id);
      } else {
        await unstarRepository(repositoryId, authUser.id);
      }
    } catch (err) {
      setLikedRepositories(previous);

      if (err instanceof ApiError) {
        const detail =
          typeof err.body === 'object' && err.body && 'detail' in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).detail)
            : null;
        setError(detail ?? 'Failed to update liked projects.');
      } else {
        setError('Failed to update liked projects.');
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
          Liked Projects
        </button>
        {error && (
          <div className="text-body12 text-red-500 bg-red-50 border border-red-200 rounded-[8px] p-[10px] mb-[12px]">
            {error}
          </div>
        )}
        <Uploads
          repositories={likedRepositories}
          columns={2}
          starredRepositoryIds={likedSet}
          showActions={canManageStars}
          onToggleStarred={handleToggleStarred}
          emptyMessage={loading ? 'Loading liked projects…' : 'No liked projects yet.'}
        />
      </div>
    </div>
  );
};

export default UserLikedProjects;
