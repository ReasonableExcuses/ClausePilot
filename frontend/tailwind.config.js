/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.025em',
        snug: '-0.015em',
      },
      colors: {
        obsidian: {
          950: '#090a0c',
          900: '#0e1013',
          850: '#14161a',
          800: '#1b1e24',
          750: '#23262e',
          700: '#2e333e',
          650: '#363b47',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        brand: {
          primary: '#4f46e5',
          hover: '#4338ca',
          subtle: 'rgba(79, 70, 229, 0.12)',
        }
      },
    },
  },
  plugins: [],
}
