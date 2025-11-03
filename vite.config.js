import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // 使用端口 3000，可以选择 8080
    host: '0.0.0.0'    // 确保应用监听所有网络接口，允许外部访问
  }
})
