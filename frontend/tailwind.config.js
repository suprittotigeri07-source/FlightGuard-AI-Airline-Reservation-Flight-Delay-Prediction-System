/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#244855', // Primary / Navy Teal
          hover: '#1D3B46',
          active: '#172F38',
          soft: '#EFF5F6',
          light: '#90AEAD',
        },
        accent: {
          DEFAULT: '#E64833', // Accent / Alert Red
          hover: '#D43823',
          light: '#F07563',
          soft: '#FDF1EF',
        },
        secondary: {
          DEFAULT: '#874F41', // Secondary / Brown
          hover: '#703F34',
          light: '#A3685A',
          soft: '#F7EFEA',
        },
        supporting: {
          DEFAULT: '#90AEAD', // Supporting / Teal Gray
          hover: '#7A9B9A',
          light: '#B4CBC9',
          soft: '#F0F6F5',
        },
        cream: {
          DEFAULT: '#FBE9D0', // Background Accent / Cream
          hover: '#F5DEBE',
          soft: '#FDF7EE',
          border: '#F2D7B4',
        },
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#0F172A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
          bg: '#F8F9FA',
          warm: '#FDF7EE',
          cream: '#FBE9D0',
        },
        content: {
          primary: '#0F172A',
          secondary: '#334155',
          muted: '#64748B',
          disabled: '#94A3B8',
          inverse: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
          focus: '#244855',
          light: '#F1F5F9',
          cream: '#F2D7B4',
        },
        semantic: {
          success: '#16A34A',
          'success-soft': '#F0FDF4',
          warning: '#EA580C',
          'warning-soft': '#FFF7ED',
          danger: '#E64833',
          'danger-soft': '#FDF1EF',
          info: '#244855',
          'info-soft': '#EFF5F6',
        },
        risk: {
          low: '#2E7D32',
          'low-bg': '#E8F5E9',
          medium: '#E65100',
          'medium-bg': '#FFF3E0',
          high: '#D84315',
          'high-bg': '#FBE9E7',
          critical: '#E64833',
          'critical-bg': '#FDF1EF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'Cambria', 'serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'xs': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'md': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'lg': '0 16px 48px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
