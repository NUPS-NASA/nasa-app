import { type FC } from 'react';

import Tile from '../../../../../shared/components/Tile';

interface Props {
  content?: string | null;
}

const AboutMe: FC<Props> = ({ content }) => {
  const safeContent = content?.trim().length ? content : 'This user has not added a bio yet.';
  return (
    <div className="flex flex-col gap-[7px]">
      <Tile className="min-h-[50px]" variant="card">
        <div className="whitespace-pre-wrap p-0 text-body14">{safeContent}</div>
      </Tile>
    </div>
  );
};

export default AboutMe;
