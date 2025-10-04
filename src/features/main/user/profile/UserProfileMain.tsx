import AboutMe from './components/AboutMe';
import Projects from './components/Projects';
import ProfileSubContainer from './components/ProfileSubContainer';
import Uploads from './components/Uploads';
import Button from '../../../../../src/shared/ui/Button';

const UserProfileMain: React.FC = () => {
  const content = `sdf
dsf
dsf
dsf
dsf
dsfdsaf
ssd
fds
sdf
d
    
    `;
  return (
    <div className="flex justify-center bg-main-bg w-full h-full overflow-scroll">
      <div className="w-[747px] pt-[40px] flex">
        <div className="w-[164px]"></div>
        <div className="w-[487px] flex flex-col gap-[15px]">
          <ProfileSubContainer title="About Me">
            <AboutMe content={content} />
          </ProfileSubContainer>

          <ProfileSubContainer title="Pinned Projects">
            <Projects />
          </ProfileSubContainer>
          <ProfileSubContainer title="nn Contributions Last Year">
            <Projects />
          </ProfileSubContainer>
          <div>
            <ProfileSubContainer title="Projects">
              <Projects />
            </ProfileSubContainer>
            <div className="mt-[10px] w-full justify-end items-end flex">
              <Button variant="primary" className="w-[105px] h-[22px]">
                See all projects
              </Button>
            </div>
          </div>
          <div>
            <ProfileSubContainer title="Uploads">
              <Uploads />
            </ProfileSubContainer>
            <div className="mt-[10px] w-full justify-end items-end flex">
              <Button variant="primary" className="w-[105px] h-[22px]">
                See all projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileMain;
