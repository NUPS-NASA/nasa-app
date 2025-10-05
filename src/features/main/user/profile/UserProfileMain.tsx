import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flower, Star } from 'lucide-react';

import AboutMe from './components/AboutMe';
import Projects from './components/Projects';
import ProfileSubContainer from './components/ProfileSubContainer';
import Uploads from './components/Uploads';
import { useAuth } from '../../../auth/AuthContext';
import Contributions from '../../../../shared/components/Contributions';
import { useUserIdParam } from '../../../../shared/hooks/useUserIdParam';
import Button from '../../../../shared/ui/Button';
import { ApiError } from '../../../../shared/api/client';
import { getUser } from '../../../../shared/api/users';
import {
  listPinnedProjects,
  listProjects,
  pinProject,
  unpinProject,
} from '../../../../shared/api/projects';
import {
  listUserRepositories,
  starRepository,
  unstarRepository,
} from '../../../../shared/api/repositories';
import { getUserContributions, getUserStats } from '../../../../shared/api/stats';
import type {
  ContributionBucket,
  ProjectRead,
  RepositoryRead,
  UserRead,
  UserStatsRead,
} from '../../../../shared/types';

type Achievement = {
  label: string;
  className: string;
  Icon: typeof Star;
};

const formatDisplayName = (user: UserRead | null): string => {
  if (!user) {
    return 'Profile';
  }

  const profileSummary = user.profile?.bio?.split('.')[0];
  if (profileSummary && profileSummary.length <= 40) {
    return profileSummary;
  }

  const emailPrefix = user.email.split('@')[0] ?? user.email;
  const tokens = emailPrefix
    .replace(/[^a-zA-Z0-9._-]/g, ' ')
    .split(/[._-]+/)
    .filter(Boolean);

  if (!tokens.length) {
    return user.email;
  }

  return tokens.map(token => token.charAt(0).toUpperCase() + token.slice(1)).join(' ');
};

const UserProfileMain = () => {
  const navigate = useNavigate();
  const userId = useUserIdParam();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<UserRead | null>(null);
  const [stats, setStats] = useState<UserStatsRead | null>(null);
  const [pinnedProjects, setPinnedProjects] = useState<ProjectRead[]>([]);
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [uploads, setUploads] = useState<RepositoryRead[]>([]);
  const [contributions, setContributions] = useState<ContributionBucket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canEditProfile = authUser?.id === userId;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;
    const viewerId = authUser?.id ?? null;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          userResponse,
          statsResponse,
          pinnedResponse,
          projectsResponse,
          uploadsResponse,
          contributionsResponse,
        ] = await Promise.all([
          getUser(userId),
          getUserStats(userId),
          listPinnedProjects(userId),
          listProjects({ memberId: userId }),
          listUserRepositories(userId, true, viewerId),
          getUserContributions(userId),
        ]);

        if (!active) {
          return;
        }

        const resolvedPinned = pinnedResponse
          .map(pin => pin.project)
          .filter((project): project is ProjectRead => Boolean(project));

        setUser(userResponse);
        setStats(statsResponse);
        setPinnedProjects(resolvedPinned);
        setProjects(projectsResponse);
        setUploads(uploadsResponse);
        setContributions(contributionsResponse?.buckets ?? []);
      } catch (err) {
        if (!active) {
          return;
        }

        if (err instanceof ApiError) {
          const detail =
            typeof err.body === 'object' &&
            err.body &&
            'detail' in (err.body as Record<string, unknown>)
              ? String((err.body as Record<string, unknown>).detail)
              : null;
          setError(detail ?? 'Failed to load profile data.');
        } else {
          setError('Failed to load profile data.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [authUser?.id, userId]);

  const navigateToSection = (segment: 'profile' | 'projects' | 'uploads' | 'likedprojects') => {
    if (!userId) {
      return;
    }

    navigate(`/user/${userId}/${segment}`);
  };

  const pinnedIds = useMemo(
    () => new Set(pinnedProjects.map(project => project.id)),
    [pinnedProjects],
  );
  const summaryProjects = useMemo(
    () => projects.filter(project => !pinnedIds.has(project.id)).slice(0, 3),
    [projects, pinnedIds],
  );
  const summaryUploads = useMemo(() => uploads.slice(0, 3), [uploads]);
  const showUploadActions = Boolean(authUser && authUser.id == userId);

  const handleTogglePinned = async (projectId: number, nextPinned: boolean) => {
    if (!userId || !canEditProfile) {
      setError('You need to be signed in as this user to manage pinned projects.');
      return;
    }

    const previousPinned = pinnedProjects;
    const targetProject =
      projects.find(project => project.id === projectId) ??
      pinnedProjects.find(project => project.id === projectId) ??
      null;

    if (nextPinned && !targetProject) {
      setError('Unable to locate project to pin.');
      return;
    }

    setPinnedProjects(prev => {
      const filtered = prev.filter(project => project.id !== projectId);
      if (nextPinned && targetProject) {
        return [targetProject, ...filtered];
      }
      return filtered;
    });

    try {
      if (nextPinned) {
        await pinProject(userId, { project_id: projectId });
      } else {
        await unpinProject(userId, projectId);
      }
    } catch (err) {
      setPinnedProjects(previousPinned);

      if (err instanceof ApiError) {
        const detail =
          typeof err.body === 'object' &&
          err.body &&
          'detail' in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).detail)
            : null;
        setError(detail ?? 'Failed to update pinned projects.');
      } else {
        setError('Failed to update pinned projects.');
      }
    }
  };

  const handleToggleStarred = async (repositoryId: number, nextStarred: boolean) => {
    if (!authUser) {
      setError('You need to be logged in to manage stars.');
      return;
    }

    setUploads(prev =>
      prev.map(repository =>
        repository.id === repositoryId ? { ...repository, starred: nextStarred } : repository,
      ),
    );

    try {
      if (nextStarred) {
        await starRepository(repositoryId, authUser.id);
      } else {
        await unstarRepository(repositoryId, authUser.id);
      }
    } catch (err) {
      setUploads(prev =>
        prev.map(repository =>
          repository.id === repositoryId ? { ...repository, starred: !nextStarred } : repository,
        ),
      );

      if (err instanceof ApiError) {
        const detail =
          typeof err.body === 'object' &&
          err.body &&
          'detail' in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).detail)
            : null;
        setError(detail ?? 'Failed to update star status.');
      } else {
        setError('Failed to update star status.');
      }
    }
  };

  const displayName = useMemo(() => formatDisplayName(user), [user]);
  const avatarUrl = user?.profile?.avatar_url || '/images/avatar-default.png';
  const projectsCount = stats?.projects ?? 0;
  const uploadsCount = stats?.uploads ?? 0;
  const followersCount = stats?.followers ?? 0;
  const followingCount = stats?.following ?? 0;

  const achievements = useMemo<Achievement[]>(() => {
    if (!stats) {
      return [
        {
          Icon: Flower,
          label: 'Getting Started',
          className: 'bg-slate-200',
        },
      ];
    }

    const items: Achievement[] = [];
    if (stats.uploads >= 3) {
      items.push({ Icon: Star, label: 'Active Uploader', className: 'bg-amber-200' });
    }
    if (stats.projects >= 2) {
      items.push({ Icon: Flower, label: 'Project Collaborator', className: 'bg-lime-300' });
    }
    if (stats.followers >= 3) {
      items.push({ Icon: Star, label: 'Community Favorite', className: 'bg-sky-200' });
    }

    if (!items.length) {
      items.push({ Icon: Flower, label: 'Exploring the cosmos', className: 'bg-slate-200' });
    }

    return items.slice(0, 3);
  }, [stats]);

  if (!userId) {
    return (
      <div className="w-full flex justify-center items-center text-body14 text-gray-500 h-full">
        Invalid user identifier.
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="w-full flex justify-center items-center text-body14 text-red-500 h-full">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-main-bg w-full">
      <div className="flex justify-center w-full">
        <div className="w-[747px] pt-[40px] flex gap-[28px]">
          <div className="w-[164px] flex flex-col gap-[23px]">
            <div className="w-full flex flex-col items-center">
              <img
                src={avatarUrl}
                alt={`${displayName} avatar`}
                className="mb-[11px] rounded-full bg-primary object-cover w-[151px] h-[151px]"
              />
              <div className="h-[24px] text-title20 mb-2 text-center" title={displayName}>
                {displayName}
              </div>
              <div className="h-[14px] text-body12 mb-[12px] text-center" title={user?.email ?? ''}>
                {user?.email ?? 'Email unavailable'}
              </div>
              {canEditProfile && (
                <Button variant="primary" className="w-[105px] h-[22px] text-white text-body12">
                  Edit Profile
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-[4px]">
              <div className="h-[17px] text-body14">
                <span className="text-title14">{projectsCount}</span> Projects
              </div>
              <div className="h-[17px] text-body14">
                <span className="text-title14">{uploadsCount}</span> Uploads
              </div>
              <div className="h-[17px] text-body14">
                <span className="text-title14">{followersCount}</span> Followers
              </div>
              <div className="h-[17px] text-body14">
                <span className="text-title14">{followingCount}</span> Following
              </div>
            </div>
            <div>
              <div className="text-title16 mb-[7px]">Achievements</div>
              <div className="flex flex-col gap-[7px]">
                {achievements.map(({ Icon, label, className }) => (
                  <div
                    key={label}
                    className={`flex justify-center items-center h-[22px] w-fit text-black text-body12 rounded-[8px] px-[8px] py-[4px] ${className}`}
                  >
                    <Icon className="w-[12px] h-[12px] mr-[4px]" />
                    <div>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-title16 mb-[7px]">Goto</div>
              <div className="flex flex-col gap-[8px]">
                <button
                  type="button"
                  onClick={() => navigateToSection('projects')}
                  className="underline text-body14 flex items-center bg-transparent border-0 p-0 text-left text-black"
                >
                  All my projects <ArrowRight className="h-[16px] w-[16px] ml-[4px]" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateToSection('uploads')}
                  className="underline text-body14 flex items-center bg-transparent border-0 p-0 text-left text-black"
                >
                  All my uploads <ArrowRight className="h-[16px] w-[16px] ml-[4px]" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateToSection('likedprojects')}
                  className="underline text-body14 flex items-center bg-transparent border-0 p-0 text-left text-black"
                >
                  Liked projects <ArrowRight className="h-[16px] w-[16px] ml-[4px]" />
                </button>
              </div>
            </div>
          </div>
          <div className="w-[487px] flex flex-col gap-[15px]">
            {error && (
              <div className="text-body12 text-red-500 bg-red-50 border border-red-200 rounded-[8px] p-[10px]">
                {error}
              </div>
            )}
            <ProfileSubContainer title="About Me">
              <AboutMe content={user?.profile?.bio ?? null} />
            </ProfileSubContainer>

            <ProfileSubContainer title="Pinned Projects">
              <Projects
                projects={pinnedProjects}
                columns={1}
                pinnedProjectIds={pinnedIds}
                showActions={canEditProfile}
                onTogglePinned={handleTogglePinned}
                emptyMessage={isLoading ? 'Loading pinned projects…' : 'No pinned projects yet.'}
              />
            </ProfileSubContainer>
            <ProfileSubContainer title="Contributions Last Year">
              <Contributions
                buckets={contributions}
                isLoading={isLoading && !contributions.length}
              />
            </ProfileSubContainer>
            <div>
              <ProfileSubContainer title="Projects">
                <Projects
                  projects={summaryProjects}
                  columns={1}
                  pinnedProjectIds={pinnedIds}
                  showActions={canEditProfile}
                  onTogglePinned={handleTogglePinned}
                  emptyMessage={isLoading ? 'Loading projects…' : 'No projects to display yet.'}
                />
              </ProfileSubContainer>
              <div className="mt-[10px] w-full justify-end items-end flex">
                <Button
                  type="button"
                  variant="primary"
                  className="w-[105px] h-[22px]"
                  onClick={() => navigateToSection('projects')}
                >
                  See all projects
                </Button>
              </div>
            </div>
            <div>
              <ProfileSubContainer title="Uploads">
                <Uploads
                  repositories={summaryUploads}
                  columns={1}
                  showActions={showUploadActions}
                  onToggleStarred={handleToggleStarred}
                  emptyMessage={isLoading ? 'Loading uploads…' : 'No uploads to display yet.'}
                />
              </ProfileSubContainer>
              <div className="mt-[10px] w-full justify-end items-end flex">
                <Button
                  type="button"
                  variant="primary"
                  className="w-[105px] h-[22px]"
                  onClick={() => navigateToSection('uploads')}
                >
                  See all uploads
                </Button>
              </div>
            </div>
            {isLoading && !user && (
              <div className="text-body12 text-gray-500">Loading profile…</div>
            )}
          </div>
        </div>
      </div>
      <div className="h-[150px]" />
    </div>
  );
};

export default UserProfileMain;
