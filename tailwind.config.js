module.exports = {
  mode: 'jit',
  purge: [
    './layouts/**/*.vue',
    './components/**/*.vue',
    './pages/**/*.vue'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
