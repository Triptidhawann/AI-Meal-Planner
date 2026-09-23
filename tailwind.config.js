/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2924',
        muted: '#68736c',
        saffron: '#f5a623',
        cream: '#fbf9f4',
        sage: '#dce9df',
        'sage-deep': '#42624d',
        line: '#e7e8e1',
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 45px rgba(31, 41, 36, 0.08)',
        card: '0 6px 20px rgba(31, 41, 36, 0.06)',
      },
    },
  },
  plugins: [],
};
