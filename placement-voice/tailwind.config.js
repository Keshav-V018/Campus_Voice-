export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { ink: '#0B1F4B', navy: { 900: '#0B1F4B', 800: '#12296A', 700: '#1B3A8C' }, brand: { 50: '#F3F6FF', 100: '#E6EDFF', 200: '#CCDAFF', 400: '#6B93FF', 500: '#3F6BF0', 600: '#2A52D4' }, amber: { 400: '#FFC53D', 500: '#F5A400' } },
    fontFamily: { display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'], sans: ['"DM Sans"', 'system-ui', 'sans-serif'] },
    boxShadow: { soft: '0 1px 2px rgba(11,31,75,.06), 0 8px 24px -12px rgba(11,31,75,.18)' }
  } },
  plugins: []
}
