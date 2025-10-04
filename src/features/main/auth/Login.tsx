import { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password, autoLogin });
  };
  return (
    <div className="bg-auth-gradient bg-cover bg-center h-screen justify-center items-center flex">
      <div className="flex flex-col items-center justify-center w-[408px] h-[295px text-white ">
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
        <form onSubmit={handleSubmit} className="flex flex-col w-full ">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-[24px] p-[10px] bg-white/10 text-body16 placeholder:text-gray text-white focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-[13px] p-[10px] bg-white/10 text-body16 placeholder:text-gray text-white focus:outline-none"
            required
          />

          <div className="flex mb-[5px] justify-between text-body12">
            <a href="#" className="underline">
              Forgot your Email or Password?
            </a>
            <div className="flex gap-[3px]">
              <span>If you are not a member</span>
              <a href="#" className="underline">
                Sign up
              </a>
            </div>
          </div>

          <div className="flex items-center justify-end text-body12 mb-[53px]">
            <input
              type="checkbox"
              checked={autoLogin}
              id="autoLogin"
              onChange={e => setAutoLogin(e.target.checked)}
              className="w-[11px] h-[11px] mr-[7px] 
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
            />
            <label htmlFor="autoLogin" className="cursor-pointer">
              <span>Automatic Login</span>
            </label>
          </div>

          <div className="w-full flex justify-center items-center">
            <button type="submit" className="w-[159px] h-[35px] bg-white text-title14 text-black">
              Log In
            </button>{' '}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
