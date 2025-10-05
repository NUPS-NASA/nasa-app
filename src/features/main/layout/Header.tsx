import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../../shared/utils';

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

  return (
    <header className="w-full">
      <div className="flex items-center border-b-[1px] border-b-gray-200 w-full h-[49px] py-[4px] px-[12px] bg-white">
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
    </header>
  );
};

export default Header;
