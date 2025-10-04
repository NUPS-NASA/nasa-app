import ProjectTile from '../../../../../shared/components/ProjectTile';
import { TileList } from '../../../../../shared/components/TileList';

const PinnedProjects: React.FC = () => {
  return (
    <>
      <TileList
        items={[0, 0]}
        columns={1}
        renderItem={(item, idx) => <ProjectTile></ProjectTile>}
      ></TileList>
    </>
  );
};

export default PinnedProjects;
