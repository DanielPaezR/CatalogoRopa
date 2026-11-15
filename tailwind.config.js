/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1c1917',
          soft: '#44403c',
        },
        sand: {
          50: '#faf8f5',
          100: '#f4f0ea',
          200: '#e8e1d6',
          300: '#d6cbbb',
        },
        accent: {
          DEFAULT: '#b4532a',
          dark: '#93401d',
          light: '#f6e7df',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fadeIn .2s ease-out',
        'slide-in': 'slideIn .25s ease-out',
      },
    },
  },
  plugins: [],
}
