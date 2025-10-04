import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Button from '../../../shared/ui/Button';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await signup({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
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
        <h1 className="text-title20 mb-[35px]">Create your Exohunt account</h1>
        <form onSubmit={handleSubmit} autoComplete="off" className="flex w-full flex-col">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={event => {
              setName(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            autoComplete="name"
            className="text-body16 mb-[24px] w-full bg-white/10 p-[10px] text-white placeholder:text-gray focus:outline-none"
            required
          />
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
            autoComplete="email"
            className="text-body16 mb-[24px] w-full bg-white/10 p-[10px] text-white placeholder:text-gray focus:outline-none"
            required
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
            autoComplete="new-password"
            className="text-body16 mb-[18px] w-full bg-white/10 p-[10px] text-white placeholder:text-gray focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={event => {
              setConfirmPassword(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            autoComplete="new-password"
            className="text-body16 mb-[13px] w-full bg-white/10 p-[10px] text-white placeholder:text-gray focus:outline-none"
            required
          />

          <div className="text-body12 mb-[5px] flex justify-between">
            <a href="#/auth/login" className="underline">
              Already have an account? Log in
            </a>
            <div className="flex gap-[3px]">
              <span>Need help?</span>
              <a href="#" className="underline">
                Contact us
              </a>
            </div>
          </div>

          <div className="text-body12 mb-[24px] flex items-center justify-end">
            <input
              type="checkbox"
              checked={agreeToTerms}
              id="agreeToTerms"
              onChange={event => setAgreeToTerms(event.target.checked)}
              className="mr-[7px] h-[11px] w-[11px]
                      cursor-pointer
                      appearance-none 
                      bg-[#D9D9D9]/20 
                      checked:bg-[#4F46E5]
                      checked:before:content-['✔']
                      checked:before:block 
                      checked:before:text-[8px] 
                      checked:before:text-white 
                      checked:before:leading-[11px] 
                      checked:before:text-center
                    "
              required
            />
            <label htmlFor="agreeToTerms" className="cursor-pointer">
              <span>I agree to the terms</span>
            </label>
          </div>

          {error && <p className="text-body12 mb-3 text-red-300">{error}</p>}

          <div className="flex w-full items-center justify-center">
            <Button type="submit" variant="login" disabled={!agreeToTerms || isSubmitting}>
              {isSubmitting ? 'Signing up...' : 'Sign Up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
