import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (GEMINI_API_KEY, API_KEY, etc.)
  const env = loadEnv(mode, process.cwd(), "");

  // Coolify normalmente injeta process.env.PORT
  const port = Number(process.env.PORT) || 3333;

  return {
    server: {
      host: true, // permite acesso externo (0.0.0.0)
      port,
    },

    preview: {
      host: true,
      port,
      allowedHosts: ["profgi.com.br"], // libera o domínio no preview
    },

    plugins: [
      react(), // plugin React oficial (sem SWC)
    ],

    define: {
      __GEMINI_API_KEY__: JSON.stringify(env.GEMINI_API_KEY ?? ""),
      __API_KEY__: JSON.stringify(env.API_KEY ?? ""),
    },

    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
    },

    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
