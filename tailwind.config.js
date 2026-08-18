/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0a0a0b',
          surface: '#111114',
          panel: '#17171c',
          elevated: '#1e1e24',
          border: '#2a2a32',
          borderLight: '#3a3a46',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#9090a0',
          muted: '#60607a',
          inverse: '#0a0a0b',
        },
        brand: {
          DEFAULT: '#6366f1',
          dim: '#4f51c8',
          muted: 'rgba(99,102,241,0.15)',
          border: 'rgba(99,102,241,0.3)',
        },
        success: {
          DEFAULT: '#22c55e',
          dim: 'rgba(34,197,94,0.15)',
          border: 'rgba(34,197,94,0.3)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dim: 'rgba(245,158,11,0.15)',
          border: 'rgba(245,158,11,0.3)',
        },
        danger: {
          DEFAULT: '#ef4444',
          dim: 'rgba(239,68,68,0.15)',
          border: 'rgba(239,68,68,0.3)',
        },
        info: {
          DEFAULT: '#3b82f6',
          dim: 'rgba(59,130,246,0.12)',
          border: 'rgba(59,130,246,0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 2s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
