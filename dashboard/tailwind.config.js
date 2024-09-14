/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "full-outer": "0 0 5px 1px rgba(0, 0, 0, 0.3)",
        top: "0 -5px 5px -5px rgba(0, 0, 0, 0.3)",
        bottom: "0 5px 5px -5px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#038c65", // Set the primary color to CFTP dark green
          secondary: "#04a074", // Slightly lighter green for hover
        },
      },
    ],
  },
};
