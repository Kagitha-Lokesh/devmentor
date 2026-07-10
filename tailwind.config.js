/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens — JavaMentor brand
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bafc',
          400: '#8194f8',
          500: '#6366f1', // primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Phase 2 Semantic Tokens
        background: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
          secondary: 'rgb(var(--color-background-secondary) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          secondary: 'rgb(var(--color-surface-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-surface-tertiary) / <alpha-value>)',
          hover: 'rgb(var(--color-surface-hover) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)', // backward compatibility
        },
        card: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          hover: 'rgb(var(--color-card-hover) / <alpha-value>)',
        },
        popover: 'rgb(var(--color-popover) / <alpha-value>)',
        tooltip: 'rgb(var(--color-tooltip) / <alpha-value>)',
        modal: 'rgb(var(--color-modal) / <alpha-value>)',
        sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
        navbar: 'rgb(var(--color-navbar) / <alpha-value>)',
        footer: 'rgb(var(--color-footer) / <alpha-value>)',
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          muted: 'rgb(var(--color-border-muted) / <alpha-value>)',
          active: 'rgb(var(--color-border-active) / <alpha-value>)',
        },
        // Brand/Action colors
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        // Text specific colors (we map them to text-{name})
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        text: {
          DEFAULT: 'rgb(var(--color-text-primary) / <alpha-value>)', // text-text
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          disabled: 'rgb(var(--color-text-disabled) / <alpha-value>)',
        },
        link: 'rgb(var(--color-link) / <alpha-value>)',
        focus: 'rgb(var(--color-focus) / <alpha-value>)',
        selection: 'rgb(var(--color-selection) / <alpha-value>)',
        scrollbar: 'rgb(var(--color-scrollbar) / <alpha-value>)',
        success: { DEFAULT: '#22c55e', foreground: '#dcfce7' },
        warning: { DEFAULT: '#f59e0b', foreground: '#fef3c7' },
        error:   { DEFAULT: '#ef4444', foreground: '#fee2e2' },
        xp:      { DEFAULT: '#a78bfa', foreground: '#ede9fe' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      spacing: {
        sidebar: '260px',
        topbar: '60px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
