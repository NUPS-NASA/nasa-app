import { type FC, useMemo } from 'react';

import type { ContributionBucket } from '../types';
import ContributionCalendar from './ContributionCalendar';
import Tile from './Tile';

interface ContributionsProps {
  buckets: ContributionBucket[];
  isLoading?: boolean;
}

const Contributions: FC<ContributionsProps> = ({ buckets, isLoading = false }) => {
  const calendarItems = useMemo(
    () => buckets.map(bucket => ({ date: bucket.date, count: bucket.count })),
    [buckets],
  );

  const totalContributions = useMemo(
    () => buckets.reduce((acc, bucket) => acc + (bucket.count ?? 0), 0),
    [buckets],
  );

  return (
    <Tile variant="card">
      <div>
        <div className="flex items-baseline justify-between mb-[10px]">
          <div className="text-title12">Contribution activity</div>
          <div className="text-body10 text-gray-500">
            {isLoading ? 'Loading…' : `${totalContributions} uploads last year`}
          </div>
        </div>
        {isLoading ? (
          <div className="h-[120px] flex items-center justify-center text-body12 text-gray-500">
            Gathering contribution data…
          </div>
        ) : buckets.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center text-body12 text-gray-500">
            No contributions in the selected period yet.
          </div>
        ) : (
          <ContributionCalendar items={calendarItems} />
        )}
        <div className="mt-[12px]">
          <div className="text-title12 h-[14px] mb-[11px]">
            uploads in the Equatorial Coordinate Star Chart
          </div>
          <img src="/images/map.png" className="w-full h-[220px]" alt="Sky map placeholder" />
        </div>
      </div>
    </Tile>
  );
};

export default Contributions;
