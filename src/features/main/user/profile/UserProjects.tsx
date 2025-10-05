import { MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectTile from '../../../../../src/shared/components/ProjectTile';
import { TileList } from '../../../../../src/shared/components/TileList';

const UserProjects = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    if (!userId) {
      return;
    }

    navigate(`/user/${userId}/profile`);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-[984px] mt-[40px]">
        <button
          type="button"
          onClick={handleBack}
          className="flex text-title20 items-center gap-[4px] mb-[10px] bg-transparent border-0 p-0 text-left text-black"
        >
          <MoveLeft className="w-[24px] h-[24px]"></MoveLeft>
          All My Projects
        </button>
        <div>
          <TileList
            items={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
            renderItem={(n, idx) => <ProjectTile key={idx}></ProjectTile>}
          ></TileList>
        </div>
      </div>
    </div>
  );
};

export default UserProjects;
