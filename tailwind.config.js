/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'Inter',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        macos: {
          desktop: '#E8E8ED',
          bg: '#F5F5F7',
          window: '#FFFFFF',
          sidebar: '#F6F6F9',
          card: '#FFFFFF',
          'card-subtle': '#F9F9FB',
          border: '#E5E5EA',
          'border-secondary': '#D1D1D6',
          segmented: '#E5E5EA',
          'segmented-active': '#FFFFFF',
          blue: {
            DEFAULT: '#007AFF',
            hover: '#0062CC',
            light: '#E5F1FF',
            subtle: '#F0F6FF',
          },
          green: {
            DEFAULT: '#34C759',
            hover: '#28A745',
            light: '#EBF9EE',
          },
          orange: {
            DEFAULT: '#FF9500',
            light: '#FFF5E5',
          },
          red: {
            DEFAULT: '#FF3B30',
            hover: '#D70015',
            light: '#FFEBEA',
          },
          purple: {
            DEFAULT: '#AF52DE',
            light: '#F5E8FD',
          },
          traffic: {
            close: '#FF5F56',
            'close-border': '#E0443E',
            min: '#FFBD2E',
            'min-border': '#DEA123',
            zoom: '#27C93F',
            'zoom-border': '#1AAB29',
          },
          text: {
            primary: '#1D1D1F',
            secondary: '#6E6E73',
            tertiary: '#86868B',
            quaternary: '#C7C7CC',
          },
        },
      },
      boxShadow: {
        'macos-window': '0 25px 80px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        'macos-card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'macos-popover': '0 10px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
