/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-roboto)', 'sans-serif'],
        retro: ['var(--font-dunggeunmo)', 'sans-serif'],
      },
      /**
       * Retro OS theme colors
       * ⚠️ Single Source of Truth: References CSS variables in globals.css.
       *    To change colors, only modify :root in globals.css.
       */
      colors: {
        retro: {
          desktop: 'var(--color-desktop)',
          taskbar: 'var(--color-taskbar)',
          'window-bg': 'var(--color-window-bg)',
          'window-title-active': 'var(--color-window-title-active)',
          'window-title-inactive': 'var(--color-window-title-inactive)',
          'border-light': 'var(--color-border-light)',
          'border-dark': 'var(--color-border-dark)',
          'border-darker': 'var(--color-border-darker)',
          'scrollbar-bg': 'var(--color-scrollbar-bg)',
        },
      },
      /**
       * Spacing with safe area consideration
       * - For mobile device notch/home indicator support
       */
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
      },
      /**
       * Viewport height utilities
       * - svh: Small viewport height (with address bar visible, stable)
       * - dvh: Dynamic viewport height (real-time reflection)
       * - lvh: Large viewport height (with address bar hidden)
       */
      height: {
        svh: '100svh',
        dvh: '100dvh',
        lvh: '100lvh',
      },
      minHeight: {
        svh: '100svh',
        dvh: '100dvh',
        lvh: '100lvh',
      },
      maxHeight: {
        svh: '100svh',
        dvh: '100dvh',
        lvh: '100lvh',
      },
    },
  },
  plugins: [typography],
};
export default config;
