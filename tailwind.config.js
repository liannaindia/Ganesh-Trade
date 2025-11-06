// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    // 可选：只扫描前台
    // "!./src/Backend/**/*.jsx"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  // 安全任意值（只允许你用到的）
  safelist: [
    'from-blue-50/50',
    'to-indigo-50/50',
    'bg-opacity-75',
    'hover:bg-opacity-75',
  ].map(cls => ({ pattern: new RegExp(`^${cls}$`) }))
}
