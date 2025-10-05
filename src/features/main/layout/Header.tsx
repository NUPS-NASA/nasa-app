import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../../shared/utils';
import Button from '../../../../src/shared/ui/Button';
import Modal from '../../../../src/shared/ui/Modal';
import { useState } from 'react';
import UploadModal from '../../repository/upload/UploadModal';

const Header = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const basePath = `/user/${user.id}`;

  const navigationItems: { label: string; to: string; end?: boolean }[] = [
    { label: 'Home', to: `${basePath}/profile`, end: true },
    { label: 'Community', to: `${basePath}/projects` },
    { label: 'About The Team', to: `${basePath}/uploads` },
  ];

  const [uploadModal, setUploadModal] = useState(false);

  return (
    <header className="flex justify-between  items-center border-b-[1px] border-b-gray-200 w-full h-[49px] py-[4px] px-[12px] bg-white">
      <div className="flex items-center">
        <NavLink to={`${basePath}/profile`} className="mr-[36px]">
          <img src="/images/logo.png" className="w-[40px] h-[40px]" />
        </NavLink>
        <nav className="flex gap-[28px]">
          {navigationItems.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'text-title16 transition-colors',
                  isActive ? 'text-primary font-semibold' : 'text-black/60 hover:text-black',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center">
        <Button
          onClick={() => setUploadModal(true)}
          variant="primary"
          className="text-body12 w-[89px] h-[22px] mr-[24px] px-[8px] py-[4px]"
        >
          New Upload
        </Button>
      </div>
      {uploadModal && (
        <Modal onClose={() => setUploadModal(false)}>
          <UploadModal onClose={() => setUploadModal(false)} />
        </Modal>
      )}
    </header>
  );
};

export default Header;
