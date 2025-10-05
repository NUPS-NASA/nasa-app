import { useEffect, useMemo, useState } from 'react';
import { MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Uploads from './components/Uploads';
import { ApiError } from '../../../../shared/api/client';
import { useAuth } from '../../../auth/AuthContext';
import {
  listRepositories,
  listUserRepositories,
  starRepository,
  unstarRepository,
} from '../../../../shared/api/repositories';
import { useUserIdParam } from '../../../../shared/hooks/useUserIdParam';
import type { RepositoryRead } from '../../../../shared/types';

const UserUploads = () => {
  const userId = useUserIdParam();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [repositories, setRepositories] = useState<RepositoryRead[]>([]);
  const [starredIds, setStarredIds] = useState<number[]>([]);
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
        const [reposResponse, starredResponse] = await Promise.all([
          listUserRepositories(userId, true),
          listRepositories({ starredBy: userId, includeSession: true }),
        ]);

        if (!active) {
          return;
        }

        setRepositories(reposResponse);
        setStarredIds(starredResponse.map(repo => repo.id));
      } catch (err) {
        if (!active) {
          return;
        }

        if (err instanceof ApiError) {
          const detail =
            typeof err.body === 'object' && err.body && 'detail' in (err.body as Record<string, unknown>)
              ? String((err.body as Record<string, unknown>).detail)
              : null;
          setError(detail ?? 'Failed to load uploads.');
        } else {
          setError('Failed to load uploads.');
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

  const starredSet = useMemo(() => new Set(starredIds), [starredIds]);
  const showActions = Boolean(authUser);

  const handleToggleStarred = async (repositoryId: number, nextStarred: boolean) => {
    if (!authUser) {
      setError('You need to be logged in to manage stars.');
      return;
    }

    setRepositories(prev =>
      prev.map(repository =>
        repository.id === repositoryId ? { ...repository, starred: nextStarred } : repository,
      ),
    );

    setStarredIds(prev => {
      const updated = new Set(prev);
      if (nextStarred) {
        updated.add(repositoryId);
      } else {
        updated.delete(repositoryId);
      }
      return Array.from(updated);
    });

    try {
      if (nextStarred) {
        await starRepository(repositoryId, authUser.id);
      } else {
        await unstarRepository(repositoryId, authUser.id);
      }
    } catch (err) {
      setRepositories(prev =>
        prev.map(repository =>
          repository.id === repositoryId ? { ...repository, starred: !nextStarred } : repository,
        ),
      );

      setStarredIds(prev => {
        const updated = new Set(prev);
        if (nextStarred) {
          updated.delete(repositoryId);
        } else {
          updated.add(repositoryId);
        }
        return Array.from(updated);
      });

      if (err instanceof ApiError) {
        const detail =
          typeof err.body === 'object' && err.body && 'detail' in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).detail)
            : null;
        setError(detail ?? 'Failed to update star status.');
      } else {
        setError('Failed to update star status.');
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
          All My Uploads
        </button>
        {error && (
          <div className="text-body12 text-red-500 bg-red-50 border border-red-200 rounded-[8px] p-[10px] mb-[12px]">
            {error}
          </div>
        )}
        <Uploads
          repositories={repositories}
          columns={2}
          starredRepositoryIds={starredSet}
          showActions={showActions}
          onToggleStarred={handleToggleStarred}
          emptyMessage={loading ? 'Loading uploads…' : 'No uploads found yet.'}
        />
      </div>
    </div>
  );
};

export default UserUploads;
