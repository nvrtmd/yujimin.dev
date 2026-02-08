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
       * Retro OS 테마 색상
       * ⚠️ Single Source of Truth: globals.css의 CSS 변수를 참조합니다.
       *    색상 변경 시 globals.css의 :root만 수정하면 됩니다.
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
       * 안전 영역을 고려한 간격
       * - 모바일 기기의 노치/홈 인디케이터 대응
       */
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
      },
      /**
       * 뷰포트 높이 유틸리티
       * - svh: 작은 뷰포트 (주소창 표시 상태, 안정적)
       * - dvh: 동적 뷰포트 (실시간 반영)
       * - lvh: 큰 뷰포트 (주소창 숨김 상태)
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
