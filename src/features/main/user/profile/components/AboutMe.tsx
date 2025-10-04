import Tile from '../../../../../../src/shared/components/Tile';

interface Props {
  content: string;
}

const AboutMe: React.FC<Props> = ({ content }) => {
  return (
    <div className="flex flex-col gap-[7px]">
      <Tile className="min-h-[50px]" variant="card">
        <div className="whitespace-pre-wrap p-0 text-body14">{content}</div>
      </Tile>
    </div>
  );
};

export default AboutMe;
