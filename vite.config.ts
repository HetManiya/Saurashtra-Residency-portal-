import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import expressApp, { connectDB } from './backend/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Vite with Express plugin...');

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
      },
      plugins: [
        react(),
        {
          name: 'express-plugin',
          configureServer(server) {
            connectDB();
            server.middlewares.use(expressApp);
          }
        }
      ],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
