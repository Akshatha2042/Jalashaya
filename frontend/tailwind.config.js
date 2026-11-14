/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jalashaya: {
          forest: '#102B25',
          midnight: '#101A20',
          navy: '#142D3B',
          blue: '#168CC5',
          cyan: '#47D4DF',
          green: '#329B71',
          amber: '#E6A84B',
          red: '#E05B54',
          white: '#F2F5F2',
          grey: '#8D9A9A',
          darkSurface: 'rgba(16, 26, 32, 0.88)',
          glassBorder: 'rgba(71, 212, 223, 0.18)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'geo-glow': '0 0 25px rgba(71, 212, 223, 0.15)',
        'water-glow': '0 0 20px rgba(22, 140, 197, 0.25)',
        'critical-glow': '0 0 20px rgba(224, 91, 84, 0.25)',
      },
      backdropBlur: {
        'geo': '12px',
      }
    },
  },
  plugins: [],
}
