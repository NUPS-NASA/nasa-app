import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#394A7F',
        },
        gray: {
          DEFAULT: '#6A6A6A',
        },
        main: {
          bg: '#F9F9F9',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
        'spline-mono': ['"Spline Sans Mono"', 'monospace'],
      },
      backgroundImage: {
        'auth-gradient':
          "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(57,74,127,0.5)), url('/images/auth-bg.jpg')",
      },
      fontSize: {
        title20: ['20px', { lineHeight: '28px', fontWeight: '700' }],
        title16: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        title14: ['14px', { lineHeight: '20px', fontWeight: '600' }],
        title12: ['12px', { lineHeight: '16px', fontWeight: '600' }],
        body18: ['18px', { lineHeight: '28px', fontWeight: '400' }],
        body16: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        body14: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        body12: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        body10: ['10px', { lineHeight: '14px', fontWeight: '400' }],
        body8: ['8px', { lineHeight: '12px', fontWeight: '400' }],
      },
    },
  },
};

export default config;
