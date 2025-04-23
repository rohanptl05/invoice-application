// import flowbitePlugin from 'flowbite/plugin';

// export default {
//   plugins: {
//     tailwindcss: {},
//     autoprefixer: {},
//     'flowbite/plugin': flowbitePlugin,
//   },
// };
// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       colors: {
//         customBlue: 'rgba(100, 100, 255, 0.5)', // Example
//       },
//     },
//   },
// };
// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',  // Use hex directly
        gray: colors.gray,   // You can still use built-in shades
        // Or define everything in hex to be safe
      }
    },
  },
  plugins: [],
}
