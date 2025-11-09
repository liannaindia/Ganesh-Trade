/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: "#FF9933",
        lotus: "#E64A19",
        adminBlue: "#3F51B5",
        saffronLight: "#FFF3E0",
        saffronDark: "#FF6D00",
      },
      fontFamily: {
        poppins: ["Poppins", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        'gradient-saffron': 'linear-gradient(to right, #FF9933, #FF6D00)',
        'gradient-lotus': 'linear-gradient(to right, #E64A19, #FF6D00)',
      },
    },
  },
  plugins: [],
};
