import type { Config } from 'tailwindcss';

// eslint-disable-next-line no-restricted-exports
export default {
  content: ['./app/**/*.{ts,tsx}'],
  prefix: 'tw-', // Use prefix for now, to avoid conflicts with bootstraps styles
  theme: {
    extend: {
      colors: {
        'shlink-brand': {
          DEFAULT: '#4696e5',
          dark: '#1f69c0',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
