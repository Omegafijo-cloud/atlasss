

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno (si existen en archivo .env o en el sistema)
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Esto permite que el código que usa 'process.env.API_KEY' funcione en el navegador
      // Inyectando el valor durante el tiempo de compilación (build time)
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    server: {
      port: 3000
    }
  };
});