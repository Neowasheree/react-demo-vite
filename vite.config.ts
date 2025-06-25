import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/tram_new/', // 注意这里的斜杠：前后都需要
  plugins: [react()],
});
