import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/react-demo-vite.git/', // ✅ 注意要加斜杠
  plugins: [react()],
});
