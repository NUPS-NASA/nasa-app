import { Planet } from '../types';
import { EllipsisVertical, Star } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../utils';
import { useState } from 'react';
import Tile from './Tile';

interface ProjectTileProps {
  project: Upload;
}

interface Upload {
  planets: Planet[];
}

const UploadTile: React.FC = () => {
  const [starred, setStarred] = useState(false);

  return (
    <Tile variant="button" className="h-[111px]">
      <div className="mr-[4px] flex-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <div className="text-title16 text-black h-[19px] mb-[4px]">Upload Titan</div>
          <div className="text-body12 text-gray-500 h-[14px] mb-[4px]">
            Finding abc star's planets
          </div>
          <div className="text-title12 text-gray-500 h-[12px]">5 members</div>
        </div>
        <div className="flex gap-[5px]">
          <Button variant="tag" className="text-black text-body12">
            sdfsdf
          </Button>
        </div>
      </div>
      <div
        className="mr-[4px] text-gray-400 w-[14.33px] h-[13.71px]"
        onClick={() => setStarred(!starred)}
      >
        <Star className={cn('w-[14.33px] h-[13.71px]', starred ? 'fill-yellow-300' : '')}></Star>
      </div>
      <div className="text-gray-400 w-[14px] h-[14px]">
        <EllipsisVertical className="w-[14px] h-[14px]"></EllipsisVertical>
      </div>
    </Tile>
  );
};

export default UploadTile;
