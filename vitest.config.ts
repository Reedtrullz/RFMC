import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 57,
        functions: 52,
        branches: 52,
        statements: 54,
      },
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared/src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
