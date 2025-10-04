import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Main: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-slate-950 text-white">
      <div className="text-center">
        <h1 className="font-sans text-title20">안녕하세요, {user?.name || user?.email}님!</h1>
        <p className="mt-2 font-sans text-body16 text-white/80">
          이제 로그인 상태가 유지되어 Exohunt의 기능을 이용하실 수 있습니다.
        </p>
      </div>
      <div className="rounded-lg bg-white/10 px-6 py-4 text-center">
        <p className="font-sans text-body14">가입일: {user?.createdAt.slice(0, 10)}</p>
        <p className="font-sans text-body14">마지막 로그인: {user?.updatedAt.slice(0, 10)}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded bg-white px-4 py-2 font-sans text-title14 text-black transition hover:bg-white/80"
      >
        로그아웃
      </button>
    </div>
  );
};

export default Main;
