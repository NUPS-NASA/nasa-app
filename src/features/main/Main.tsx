import { Outlet } from 'react-router-dom';
import Header from './layout/Header';

const Main: React.FC = () => {
  return (
    <div className="bg-main-bg w-full h-full overflow-auto">
      <div className="sticky top-0 z-50">
        <Header></Header>
      </div>
      <Outlet />
      <div className="h-[150px]"></div>
    </div>
  );
};

export default Main;
