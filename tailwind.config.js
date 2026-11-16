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
        bone: {
          DEFAULT: '#f3efe9',
          dark: '#e9e3da',
        },
        sale: '#9b2c1f',
        accent: {
          DEFAULT: '#b4532a',
          dark: '#93401d',
          light: '#f6e7df',
        },
      },
      letterSpacing: {
        label: '0.18em',
        wide2: '0.28em',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        slideInLeft: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        slideDown: { from: { transform: 'translateY(-8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        rise: { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        kenburns: { from: { transform: 'scale(1.08)' }, to: { transform: 'scale(1)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-in': 'fadeIn .2s ease-out',
        'slide-in': 'slideIn .35s cubic-bezier(.2,.8,.2,1)',
        'slide-in-left': 'slideInLeft .35s cubic-bezier(.2,.8,.2,1)',
        'slide-down': 'slideDown .25s ease-out',
        rise: 'rise .9s cubic-bezier(.2,.8,.2,1) both',
        kenburns: 'kenburns 2.4s cubic-bezier(.2,.8,.2,1) both',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
}
