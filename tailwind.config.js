/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      backgroundColor: {
        background: '#1a1b1e',
        card: '#25262b',
      },
      borderColor: {
        border: '#2e2e35',
      },
      textColor: {
        default: '#f3f4f6',
        muted: '#9ca3af',
      },
    },
  },
  plugins: [],
};