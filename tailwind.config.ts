import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366F1',
          foreground: '#FFFFFF',
          soft: '#EEF2FF',
        },
        accent: {
          DEFAULT: '#F97316',
          soft: '#FFF7ED',
        },
        surface: {
          DEFAULT: '#F5F7FB',
          subtle: '#EDF1F7',
        },
        success: {
          DEFAULT: '#22C55E',
          soft: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          soft: '#FEF3C7',
        },
        destructive: {
          DEFAULT: '#EF4444',
          soft: '#FEE2E2',
        },
      },
      boxShadow: {
        subtle: '0 10px 30px -15px rgba(15, 23, 42, 0.25)',
        focus: '0 0 0 4px rgba(99, 102, 241, 0.15)',
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.25rem",
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'emphasized': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
export default config
