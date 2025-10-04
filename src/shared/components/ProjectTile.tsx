import { Planet } from '../types';
import { Pin, EllipsisVertical } from 'lucide-react';
import Button from '../ui/Button';
import { useState } from 'react';
import { cn } from '../utils';
import Tile from './Tile';

interface ProjectTileProps {
  project: Project;
}

interface Project {
  planets: Planet[];
}

const planetImages = [
  '/svg/planet-placeholder-pink.svg',
  '/svg/planet-placeholder-blue.svg',
  '/svg/planet-placeholder-mint.svg',
  '/svg/planet-placeholder-yellow.svg',
];

const ProjectTile: React.FC = () => {
  const [pinned, setPinned] = useState(false);

  const randomImage = planetImages[Math.floor(Math.random() * planetImages.length)];
  return (
    <Tile variant="button" className="h-[111px]">
      <div className="w-[87px] h-[87px] mr-[12px]">
        <img src={randomImage} alt="" />
      </div>
      <div className="mr-[4px] flex-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <div className="text-title16 text-black h-[19px] mb-[4px]">Project Titan</div>
          <div className="text-body12 text-gray-500 h-[14px] mb-[2px]">
            Finding abc star's planets
          </div>
          <div className="text-body10 text-gray-400 h-[12px]">5 members</div>
        </div>
        <div className="flex gap-[5px]">
          <Button variant="tag">sdfsdf</Button>
        </div>
      </div>
      <div className="mr-[4px] text-gray-400 w-[16px] h-[16px]" onClick={() => setPinned(!pinned)}>
        <Pin className={cn('w-[16px] h-[16px]', pinned ? 'fill-red-500' : '')}></Pin>
      </div>
      <div className="text-gray-400 w-[14px] h-[14px]">
        <EllipsisVertical className="w-[14px] h-[14px]"></EllipsisVertical>
      </div>
    </Tile>
  );
};

export default ProjectTile;
