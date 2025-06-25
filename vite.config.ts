import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/tram_new/', // ← 这里是你的 GitHub 仓库名！前后都要加 /
  plugins: [react()],
});
