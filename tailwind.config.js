/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
