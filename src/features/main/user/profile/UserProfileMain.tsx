import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Flower, Star } from 'lucide-react';
import AboutMe from './components/AboutMe';
import Projects from './components/Projects';
import ProfileSubContainer from './components/ProfileSubContainer';
import Uploads from './components/Uploads';
import Button from '../../../../../src/shared/ui/Button';
import Contributions from '../../../../shared/components/Contributions';

const UserProfileMain = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const navigateToSection = (segment: 'profile' | 'projects' | 'uploads' | 'likedprojects') => {
    if (!userId) {
      return;
    }

    navigate(`/user/${userId}/${segment}`);
  };

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
    <div className="bg-main-bg w-full">
      <div className="flex justify-center w-full">
        <div className="w-[747px] pt-[40px] flex gap-[28px]">
          <div className="w-[164px] flex flex-col gap-[23px]">
            <div className="w-full flex flex-col items-center">
              <img
                src="/images/avatar-default.png"
                alt=""
                className="mb-[11px] rounded-full bg-primary object-cover w-[151px] h-[151px]"
              />
              <div className="h-[24px] text-title20 mb-4">Inseong Seo</div>
              <div className="h-[14px] text-body12 mb-[12px]">Seogroup@kaist.ac.kr </div>
              <Button variant="primary" className="w-[105px] h-[22px] text-white text-body12">
                Edit Profile
              </Button>
            </div>
            <div className="flex flex-col gap-[4px] ">
              <div className="h-[17px] text-body14">
                <span className="text-title14">10</span> Projects
              </div>
              <div className="h-[17px] text-body14">
                <span className="text-title14">42</span> Uploads
              </div>
              <div className="h-[17px] text-body14">
                <span className="text-title14">923</span> Followers
              </div>
              <div className="h-[17px] text-body14">
                <span className="text-title14">42</span> Following
              </div>
            </div>
            <div>
              <div className="text-title16 mb-[7px]">Achievements</div>
              <div className="flex flex-col gap-[7px]">
                <div className="flex justify-center items-center h-[22px] w-fit text-black text-body12 rounded-[8px] bg-amber-200 px-[8px] py-[4px]">
                  <Star className="w-[12px] h-[12px] mr-[4px] fill-black"></Star>
                  <div>Rising Star </div>
                </div>
                <div className="flex justify-center items-center h-[22px] w-fit text-black text-body12 rounded-[8px] bg-lime-300 px-[8px] py-[4px]">
                  <Flower className="w-[12px] h-[12px] mr-[4px] "></Flower>
                  <div>Amateur Leader </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-title16 mb-[7px]">Goto</div>
              <div className="flex flex-col gap-[8px]">
                <button
                  type="button"
                  onClick={() => navigateToSection('projects')}
                  className="underline text-body14 flex items-center bg-transparent border-0 p-0 text-left text-black"
                >
                  All my projects <ArrowRight className="h-[16px] w-[16px] ml-[4px]"></ArrowRight>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToSection('uploads')}
                  className="underline text-body14 flex items-center bg-transparent border-0 p-0 text-left text-black"
                >
                  All my uploads <ArrowRight className="h-[16px] w-[16px] ml-[4px]"></ArrowRight>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToSection('likedprojects')}
                  className="underline text-body14 flex items-center bg-transparent border-0 p-0 text-left text-black"
                >
                  Liked projects <ArrowRight className="h-[16px] w-[16px] ml-[4px]"></ArrowRight>
                </button>
              </div>
            </div>
          </div>
          <div className="w-[487px] flex flex-col gap-[15px]">
            <ProfileSubContainer title="About Me">
              <AboutMe content={content} />
            </ProfileSubContainer>

            <ProfileSubContainer title="Pinned Projects">
              <Projects />
            </ProfileSubContainer>
            <ProfileSubContainer title="nn Contributions Last Year">
              <Contributions></Contributions>
            </ProfileSubContainer>
            <div>
              <ProfileSubContainer title="Projects">
                <Projects />
              </ProfileSubContainer>
              <div className="mt-[10px] w-full justify-end items-end flex">
                <Button
                  type="button"
                  variant="primary"
                  className="w-[105px] h-[22px]"
                  onClick={() => navigateToSection('projects')}
                >
                  See all projects
                </Button>
              </div>
            </div>
            <div>
              <ProfileSubContainer title="Uploads">
                <Uploads />
              </ProfileSubContainer>
              <div className="mt-[10px] w-full justify-end items-end flex">
                <Button
                  type="button"
                  variant="primary"
                  className="w-[105px] h-[22px]"
                  onClick={() => navigateToSection('uploads')}
                >
                  See all uploads
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[150px]"></div>
    </div>
  );
};

export default UserProfileMain;
