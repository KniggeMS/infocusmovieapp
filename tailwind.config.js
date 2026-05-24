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
        'accent-glow': 'var(--accent-glow)',
        'accent-color': 'var(--accent-color)',
        
        // Frosted Glass Tokens
        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
        'glass-tint': 'var(--glass-tint)',
        'tabbar-bg': 'var(--tabbar-bg)',
        'sheet-bg': 'var(--sheet-bg)',
        
        // Legacy / Specifics
        'app-dark': '#0f172a',
        'app-card': '#1e293b',
        'accent-blue': '#3b82f6',
        gray: {
          900: '#111827',
          800: '#1f2937', 
          700: '#374151'
        }
      },
      backdropBlur: {
        'glass': 'var(--glass-blur)',
        'tabbar': 'var(--tabbar-blur)',
        'sheet': 'var(--sheet-blur)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease forwards',
        'slide-up': 'slide-up 0.4s ease forwards',
        'slide-down': 'slide-down 0.4s ease forwards',
        'scale-in': 'scale-in 0.3s ease forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}