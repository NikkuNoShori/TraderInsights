/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-foreground)',
          50: 'var(--primary-50)',
          30: 'var(--primary-30)',
          20: 'var(--primary-20)',
          10: 'var(--primary-10)',
        },
        // Status colors
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        profit: 'var(--profit)',
        loss: 'var(--loss)',
        neutral: 'var(--neutral)',
      },
      backgroundColor: {
        // Theme backgrounds
        background: 'var(--background)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        'input-bg': 'var(--input-bg)',
        'button-bg': 'var(--button-bg)',
        'button-hover': 'var(--button-hover)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
      },
      textColor: {
        DEFAULT: 'var(--text)',
        default: 'var(--text)',
        muted: 'var(--text-muted)',
        dim: 'var(--text-dim)',
        'input-text': 'var(--input-text)',
        'input-placeholder': 'var(--input-placeholder)',
      },
      ringColor: {
        DEFAULT: 'var(--primary)',
        primary: {
          DEFAULT: 'var(--primary)',
          50: 'var(--primary-50)',
          30: 'var(--primary-30)',
          20: 'var(--primary-20)',
          10: 'var(--primary-10)',
        },
      },
    },
  },
  plugins: [],
};