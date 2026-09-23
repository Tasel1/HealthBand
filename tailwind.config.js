/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#090a0f',
          900: '#0d1017',
          850: '#11141d',
          800: '#161b26',
          750: '#1c2230',
          border: '#1c212d',
          'border-light': '#272f3f',
        },
        clinical: {
          bg: '#0b1120',
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          muted: '#94a3b8',
          teal: '#0d9488',
          cyan: '#06b6d4',
          normal: '#10b981',
          warning: '#f59e0b',
          alert: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
