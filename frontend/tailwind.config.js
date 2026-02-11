/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Radiant-style: light SaaS, soft accent
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#f8fafc',
          light: '#ffffff',
          lighter: '#f1f5f9',
          muted: '#94a3b8',
        },
        cream: '#ffffff',
        ink: '#0f172a',
      },
      borderRadius: {
        pill: '9999px',
        card: '1rem',
        bento: '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        cardHover: '0 10px 40px -10px rgb(0 0 0 / 0.1), 0 4px 12px -4px rgb(0 0 0 / 0.06)',
        bento: '0 4px 20px -4px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
}

