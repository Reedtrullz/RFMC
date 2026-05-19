/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cdu-screen': '#0a0a0a',
        'cdu-text': '#39ff14',
        'cdu-text-dim': '#1a8c0a',
        'cdu-amber': '#ffb000',
        'cdu-cyan': '#00d0ff',
        'cdu-bezel': '#1a1a1a',
        'cdu-bezel-light': '#2a2a2a',
        'cdu-exec': '#00ff00',
        'cdu-error': '#ff3333',
        'cdu-magenta': '#e879f9',
        'cdu-white': '#ffffff',
        'cdu-shaded': '#e5e5e5',
        'cdu-blue': '#60a5fa',
      },
      fontFamily: {
        cdu: ['"B612 Mono"', '"Courier New"', 'Courier', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'pulse-exec': {
          '0%, 100%': { backgroundColor: 'rgba(0, 255, 0, 0.1)' },
          '50%': { backgroundColor: 'rgba(0, 255, 0, 0.3)' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'pulse-exec': 'pulse-exec 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
