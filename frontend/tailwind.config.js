/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Azul-oceano da logo: cor principal.
        ocean: {
          50: '#eef9fd', 100: '#d4f0fb', 200: '#a6e0f7', 300: '#6ccaf0', 400: '#2fb0e3',
          500: '#0c95cc', 600: '#0a7aa8', 700: '#0b6087', 800: '#0d4f6e', 900: '#0c4259',
        },
        // Dourado-areia da logo: destaques.
        sun: {
          50: '#fdf8ef', 100: '#faedd2', 200: '#f4d7a0', 300: '#eebb66', 400: '#e5a046',
          500: '#d4862b', 600: '#b26a1f', 700: '#8f5319', 800: '#6f4117', 900: '#56321a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(41, 37, 36, 0.04), 0 2px 8px rgba(41, 37, 36, 0.05)',
      },
    },
  },
  plugins: [],
};
