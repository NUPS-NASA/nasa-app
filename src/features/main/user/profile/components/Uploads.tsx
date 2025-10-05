import UploadTile from '../../../../../../src/shared/components/UploadTile';
import ProjectTile from '../../../../../shared/components/ProjectTile';
import { TileList } from '../../../../../shared/components/TileList';

interface Props {
  colums?: number;
}

const Uploads: React.FC<Props> = ({ colums = 1 }) => {
  return (
    <TileList
      items={[0, 0, 0]}
      columns={1}
      renderItem={(item, idx) => <UploadTile key={idx}></UploadTile>}
    ></TileList>
  );
};

export default Uploads;
