/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        alton: ['Alton Trial', 'sans-serif'],
      },
      colors: {
        brandColor:"#12083E",
        brandActive:"#F79B1E"
      },
    },
  },
  plugins: [],
};
