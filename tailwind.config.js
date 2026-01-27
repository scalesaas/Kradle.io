module.exports = {
  // 👇 verify this line matches your folder structure exactly
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"], 
// @ts-ignore
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}