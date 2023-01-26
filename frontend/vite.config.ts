import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // see: https://github.com/vitejs/vite/issues/7362
  // ogp の画像を vite がコンパイルしたものに書き換えてくれないので、
  // public を直接参照できるようにする
  publicDir: 'public',
});
