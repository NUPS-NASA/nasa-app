import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (user) {
      navigate('/', { replace: true });
    }
  }, [isReady, navigate, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-auth-gradient flex h-screen items-center justify-center bg-cover bg-center">
      <div className="flex w-[408px] flex-col items-center justify-center text-white">
        <div
          style={{
            backgroundImage: 'url("/images/icon_trans_512x512.png")',
            width: '100px',
            height: '100px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className="mb-[53px]"
        ></div>
        <h1 className="text-title20 mb-[35px]">Log into Exohunt</h1>
        <form onSubmit={handleSubmit} className="flex w-full flex-col">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={event => {
              setEmail(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            className="text-body16 mb-[24px] w-full bg-white/10 p-[10px] text-white placeholder:text-gray focus:outline-none"
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={event => {
              setPassword(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            className="text-body16 mb-[13px] w-full bg-white/10 p-[10px] text-white placeholder:text-gray focus:outline-none"
            required
            autoComplete="current-password"
          />

          <div className="text-body12 mb-[24px] flex justify-between">
            <a href="#" className="underline">
              Forgot your Email or Password?
            </a>
            <div className="flex gap-[3px]">
              <span>If you are not a member</span>
              <a href="#/auth/signup" className="underline">
                Sign up
              </a>
            </div>
          </div>

          {error && <p className="text-body12 mb-3 text-red-300">{error}</p>}

          <div className="flex w-full items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-title14 flex h-[35px] w-[159px] items-center justify-center bg-white text-black disabled:cursor-not-allowed disabled:bg-white/60"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
