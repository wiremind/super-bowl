// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.html', './src/**/*.js', './src/**/*.vue'],
  theme: {
    extend: {
      colors: {
        wiremind: '#335870'
      }
    }
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['hover', 'disabled']
    }
  },
  plugins: []
};
