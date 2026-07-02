import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // głęboki granat z ciepłym podbiciem — nie zimna czerń
        night: {
          950: '#0a0d15',
          900: '#0f1320',
          800: '#151b2c',
          700: '#1c2539',
        },
        // warm off-white
        warm: {
          50: '#f5f2ea',
          100: '#e9e4d8',
        },
        // muted sand / beige
        sand: {
          200: '#ded2b8',
          300: '#cdbd9c',
          400: '#b3a17d',
        },
        // copper / sunset highlight
        copper: {
          300: '#f0a869',
          400: '#e08a4e',
          500: '#c9713a',
        },
        // restrained ocean blue
        ocean: {
          300: '#7fa8c9',
          400: '#5b8fb3',
          500: '#3f6f92',
        },
        gold: {
          400: '#cfa85c',
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
