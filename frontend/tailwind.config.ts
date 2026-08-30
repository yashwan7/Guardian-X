import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        vision: {
          bg: '#eef2f7',
          surface: '#ffffff',
          glass: 'rgba(255, 255, 255, 0.82)',
          'glass-dark': 'rgba(15, 23, 42, 0.78)',
          coral: '#ff8fa3',
          peach: '#ffb5a7',
          lavender: '#b8c0ff',
          iris: '#a78bfa',
          azure: '#3b82f6',
          sky: '#38bdf8',
          mint: '#34d399',
          border: 'rgba(255, 255, 255, 0.7)',
          'border-dark': 'rgba(255, 255, 255, 0.12)',
        },
      },
      backgroundImage: {
        'vision-hero': 'linear-gradient(135deg, #ffa8ba 0%, #fed7aa 40%, #c4b5fd 75%, #60a5fa 100%)',
        'vision-azure': 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
        'vision-sky': 'linear-gradient(135deg, #0284c7 0%, #38bdf8 60%, #86efac 100%)',
        'vision-mint': 'linear-gradient(135deg, #10b981 0%, #6ee7b7 60%, #93c5fd 100%)',
        'vision-peach': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fed7aa 100%)',
        'vision-ambient': 'radial-gradient(at 0% 0%, rgba(255, 168, 186, 0.25) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(96, 165, 250, 0.22) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(196, 181, 253, 0.2) 0px, transparent 50%)',
      },
      boxShadow: {
        'vision-glass': '0 20px 40px -15px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        'vision-card': '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
        'vision-elevated': '0 25px 50px -12px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
        'vision-knob': '0 4px 12px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
};

export default config;