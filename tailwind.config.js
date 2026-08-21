/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8F5EE',
          100: '#C8E6D5',
          200: '#9FD8BA',
          300: '#5DC290',
          400: '#2BB673',
          500: '#0F8E4E',
          600: '#0A6B3A',
          700: '#085041',
          800: '#04342C',
          900: '#021E16'
        },
        cream: {
          50: '#FAF8F3',
          100: '#F5F1E8',
          200: '#F0F0EC',
          300: '#E8E6E0'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang TC"', '"Microsoft JhengHei"', 'sans-serif']
      },
      maxWidth: {
        app: '440px'
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px'
      }
    }
  },
  plugins: []
}
