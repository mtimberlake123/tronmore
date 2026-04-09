/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        'on-primary': '#ffffff',
        'surface-dim': '#131313',
        'surface': '#1a1c1e',
        'surface-container': '#1f1f1f',
        'surface-container-low': '#1b1b1b',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353535',
        'surface-container-lowest': '#0e0e0e',
        'on-surface': '#e2e2e2',
        'on-surface-variant': '#c6c6c6',
        'outline': '#919191',
        'outline-variant': '#474747',
        secondary: '#c6c6cf',
        error: '#ffb4ab',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
      },
      backdropBlur: {
        'xs': '4px',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(0, 122, 255, 0.25)',
        'glow-lg': '0 0 20px rgba(0, 122, 255, 0.4)',
        'nav': '0 32px 64px -16px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}