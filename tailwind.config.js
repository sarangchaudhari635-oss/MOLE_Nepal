/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                /* ── M3-inspired palette from the reference design ── */
                'pe-primary': '#00393e',
                'pe-primary-container': '#205055',
                'pe-on-primary': '#ffffff',
                'pe-on-primary-container': '#92c1c6',
                'pe-tertiary': '#003c0b',
                'pe-tertiary-container': '#005614',
                'pe-tertiary-fixed': '#98f994',
                'pe-tertiary-fixed-dim': '#7ddc7a',
                'pe-on-tertiary-fixed': '#002204',
                'pe-surface': '#f4faff',
                'pe-surface-dim': '#cfdce4',
                'pe-surface-container': '#e3f0f8',
                'pe-surface-container-low': '#e9f6fd',
                'pe-surface-container-high': '#ddeaf2',
                'pe-surface-container-highest': '#d7e4ec',
                'pe-surface-container-lowest': '#ffffff',
                'pe-on-surface': '#111d23',
                'pe-on-surface-variant': '#404849',
                'pe-outline': '#707979',
                'pe-outline-variant': '#c0c8c9',
                'pe-inverse-surface': '#263238',
                'pe-inverse-on-surface': '#e6f3fb',
                'pe-secondary': '#4c616c',
                'pe-secondary-container': '#cfe6f2',
                'pe-error': '#ba1a1a',
                /* ── Existing brand colours (kept for dashboard pages) ── */
                brand: {
                    50: '#F4FBF9',
                    100: '#E2F5EE',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065F46',
                    900: '#064E3B',
                },
                surface: {
                    50: '#FCFCFC',
                    100: '#F5F5F7',
                    200: '#E5E5EA',
                    300: '#D1D1D6',
                    400: '#A1A1A6',
                    500: '#8E8E93',
                    600: '#636366',
                    700: '#48484A',
                    800: '#3A3A3C',
                    900: '#1C1C1E',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                headline: ['Manrope', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(16, 185, 129, 0.15)',
                'card': '0 2px 10px rgba(0, 0, 0, 0.02), 0 10px 30px rgba(0, 0, 0, 0.04)',
            },
            keyframes: {
                shimmer: {
                    '100%': { transform: 'translateX(100%)' }
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                },
                'pulse-dot': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.4)', opacity: '0.5' },
                },
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
            animation: {
                shimmer: 'shimmer 2.5s infinite',
                scan: 'scan 2s ease-in-out infinite alternate',
                'fade-in': 'fade-in 0.6s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
                'shake': 'shake 0.4s ease-in-out',
                'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 6s ease infinite',
            },
        },
    },
    plugins: [],
}
