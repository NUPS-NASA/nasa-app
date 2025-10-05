import { Outlet } from 'react-router-dom';
import Header from './layout/Header';

const Main: React.FC = () => {
  return (
    <div className="bg-main-bg min-h-screen w-full">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <div className="min-h-[calc(100vh-49px)]">
        <Outlet />
      </div>
      <div className="h-[150px]" />
    </div>
  );
};

export default Main;
