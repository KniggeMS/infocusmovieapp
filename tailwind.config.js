/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Theme Colors
        'app-bg': 'var(--bg-primary)',
        'app-secondary': 'var(--bg-secondary)',
        'app-card-bg': 'var(--bg-card)',
        'app-text': 'var(--text-main)',
        'app-text-muted': 'var(--text-muted)',
        'app-border': 'var(--border-color)',
        
        // Legacy / Specifics
        'app-dark': '#0f172a',
        'app-card': '#1e293b',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'accent-blue': '#3b82f6',
        'accent-glow': '#60a5fa',
        gray: {
          900: '#111827',
          800: '#1f2937', 
          700: '#374151'
        }
      }
    },
  },
  plugins: [],
}