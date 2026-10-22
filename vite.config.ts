import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // hoặc vue tùy vào dự án của bạn

// https://vitejs.dev/config/
export default defineConfig({
  base: '/-N-T-P/', // Thêm dòng này để khớp với tên repository
  plugins: [react()],
})
