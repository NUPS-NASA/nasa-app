import { listProjects } from '../../shared/api/projects';
import type { ProjectRead } from '../../shared/types';
import type { Post } from '../../shared/types/post';

export const fetchCommunityProjects = async (): Promise<ProjectRead[]> => {
  return await listProjects();
};

type RawPost = Omit<Post, 'linkedProject'> & { linkedProjectId?: number };

export const fetchCommunityPosts = async (
  filter: 'all' | Post['category'] = 'all',
): Promise<Post[]> => {
  const rawPosts: RawPost[] = [
    {
      id: 101,
      title: 'Aurora Watch: Solar Storm Update for Tonight',
      content:
        'NOAA just bumped tonight\'s aurora forecast to G3. If you\'re in mid-latitudes, point your wide-field rigs north and watch Kp values after 22:00 UTC. Share your captures in the gallery thread!',
      author: 'Mission Control',
      category: 'announcements',
      likes: 42,
      liked: true,
      comments: [
        {
          id: 201,
          author: 'AuroraChaser',
          content: 'Thanks for the heads up! Setting up my all-sky cam now.',
          createdAt: '2025-10-05T09:45:00Z',
        },
        {
          id: 202,
          author: 'NorthernLights',
          content: 'Clouds over Reykjavik, crossing my fingers for a break!',
          createdAt: '2025-10-05T10:02:00Z',
        },
      ],
      createdAt: '2025-10-05T08:30:00Z',
      linkedProjectId: 1,
    },
    {
      id: 102,
      title: 'Astrophoto of the Week: NGC 1300 Barred Spiral',
      content:
        'Captured over four clear nights with our DeepSky rig using dual-narrowband filters and drizzle stacking. Swipe through for the Ha and OIII comparisons!',
      author: 'LunaScope Collective',
      category: 'astrophoto-gallery',
      likes: 67,
      liked: false,
      comments: [
        {
          id: 203,
          author: 'OrbitOps',
          content: 'Mind sharing the PixInsight workflow? The colour separation is gorgeous.',
          createdAt: '2025-10-04T23:55:00Z',
        },
      ],
      createdAt: '2025-10-04T23:40:00Z',
    },
    {
      id: 103,
      title: 'Project HaloSpectra v2.1 Released',
      content:
        'Our spectral classifier now flags likely hot Jupiter candidates 30% faster. New in this release: GPU batch inference support and integrated vetting with the Mission Control dashboard.',
      author: 'Team HaloSpectra',
      category: 'project-showcase',
      likes: 51,
      liked: true,
      comments: [
        {
          id: 204,
          author: 'SpectraSuite',
          content: 'Congrats! Curious how you handled the new TESS DR updates.',
          createdAt: '2025-10-03T14:10:00Z',
        },
      ],
      createdAt: '2025-10-03T12:25:00Z',
      linkedProjectId: 1,
    },
    {
      id: 104,
      title: 'Upload Hall of Fame: SpectraSuite 3.0 Hits 15k Downloads',
      content:
        'Shout-out to the SpectraSuite crew—their new automated vetting widgets are saving everyone hours per target. Drop your favourite module in the comments.',
      author: 'Community Team',
      category: 'upload-hall-of-fame',
      likes: 88,
      liked: true,
      comments: [],
      createdAt: '2025-10-02T16:00:00Z',
    },
    {
      id: 105,
      title: 'Announcements: October Deep Field Campaign Briefing',
      content:
        'Kicking off a month-long campaign focused on deep field photometry of M31 satellite candidates. Join Thursday\'s call for cadence planning and instrument coordination.',
      author: 'Mission Control',
      category: 'announcements',
      likes: 24,
      liked: false,
      comments: [],
      createdAt: '2025-10-01T18:00:00Z',
    },
    {
      id: 106,
      title: 'Project Spotlight: Lunar Occultation Tracker Beta',
      content:
        'We just published the beta pipeline for predicting lunar occultations of bright radio sources. Looking for observers in Asia-Pacific to validate the ephemerides.',
      author: 'OccultationNet',
      category: 'project-showcase',
      likes: 19,
      liked: false,
      comments: [
        {
          id: 205,
          author: 'RadioScout',
          content: 'Count me in from Perth—will log tonight\'s measurements.',
          createdAt: '2025-09-29T11:20:00Z',
        },
      ],
      createdAt: '2025-09-29T08:45:00Z',
    },
    {
      id: 107,
      title: 'Astrophoto Gallery: Perseid Meteor Composite',
      content:
        'Stacked 120 frames from the Perseid peak over the Atacama. Annotated the brightest trails with their radiant vectors—feel free to use the dataset for outreach slides.',
      author: 'SkyTrail Studio',
      category: 'astrophoto-gallery',
      likes: 53,
      liked: false,
      comments: [],
      createdAt: '2025-09-27T05:30:00Z',
    },
  ];

  let projects: ProjectRead[] = [];
  try {
    projects = await listProjects();
  } catch (error) {
    console.warn('[community] Failed to load projects for linked posts', error);
  }

  const projectById = new Map(projects.map(project => [project.id, project]));

  const mergedPosts: Post[] = rawPosts
    .map(({ linkedProjectId, ...rest }) => ({
      ...rest,
      linkedProject: linkedProjectId ? projectById.get(linkedProjectId) : undefined,
    }))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  if (filter === 'all') {
    return mergedPosts;
  }

  return mergedPosts.filter(post => post.category === filter);
};