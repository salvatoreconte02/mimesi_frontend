/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2D5BA6', // MIMESI Navy
          hover: '#234A8C',
          light: '#4A75BF',
          lighter: '#E8EEF7',
        },
        secondary: {
          DEFAULT: '#3E9FD9', // MIMESI Cyan
          hover: '#2C8AC4',
          light: '#5FB3E5',
          lighter: '#E5F4FB',
        },
        neutral: {
          50: '#F5F7FA',
          100: '#E8ECF2',
          200: '#D1D9E6',
          800: '#1A1F29',
        },
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
      },
      backgroundImage: {
        'mimesi-gradient': 'linear-gradient(135deg, #2D5BA6 0%, #3E9FD9 100%)',
      }
    },
  },
  plugins: [],
}