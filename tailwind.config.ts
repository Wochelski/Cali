import type { Config } from 'tailwindcss'

/**
 * Kolory wskazują na zmienne CSS z globals.css (rgb triplets),
 * dzięki czemu paleta "Pacific sunset" jest zdefiniowana w jednym miejscu
 * i działa z modyfikatorami przezroczystości Tailwinda.
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: v('night-950'),
          900: v('night-900'),
          800: v('night-800'),
          700: v('night-700'),
          600: v('night-600'),
        },
        ivory: {
          50: v('ivory-50'),
          100: v('ivory-100'),
        },
        sand: {
          300: v('sand-300'),
        },
        mist: {
          400: v('mist-400'),
        },
        gold: {
          300: v('gold-300'),
          400: v('gold-400'),
          500: v('gold-500'),
        },
        blush: {
          300: v('blush-300'),
          400: v('blush-400'),
        },
        pacific: {
          300: v('pacific-300'),
          400: v('pacific-400'),
          500: v('pacific-500'),
        },
        redwood: {
          900: v('redwood-900'),
        },
        canyon: {
          300: v('canyon-300'),
          400: v('canyon-400'),
        },
        palm: {
          500: v('palm-500'),
        },
        neon: {
          400: v('neon-400'),
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'system-ui',
          'sans-serif',
        ],
      },
      letterSpacing: {
        kicker: '0.24em',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
