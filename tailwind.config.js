// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // 扫描所有 React 文件
  ],
  darkMode: 'class', // 启用 class-based 暗黑模式
  theme: {
    extend: {
      colors: {
        // 可选：自定义颜色扩展
        primary: {
          DEFAULT: '#ff9933',
          light: '#ffaa4d',
          dark: '#e68a2e',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true, // 确保 Tailwind 重置样式生效
  },
  // 修复：允许任意透明度类（如 from-blue-50/50）
  safelist: [
    {
      pattern: /.*/, // 允许所有类（包括任意透明度）
      variants: ['hover', 'dark', 'focus', 'active'],
    },
  ],
}
