import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  // Coolify define process.env.PORT — usa se existir, senão 3333
  const port = Number(process.env.PORT) || 3333;

  return {
    server: {
      host: true, // permite acesso externo (0.0.0.0)
      port,
    },

    preview: {
      host: true,
      port,
      allowedHosts: ["profgi.com.br"], // ok no Coolify
    },

    plugins: [
      react(),                         // plugin SWC correto
      mode === "development" && componentTagger(), // tagger só no dev
    ].filter(Boolean),

    define: {
      __GEMINI_API_KEY__: JSON.stringify(env.GEMINI_API_KEY ?? ""),
      __API_KEY__: JSON.stringify(env.API_KEY ?? ""),
    },

    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"), // mais seguro que __dirname
      },
    },

    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});