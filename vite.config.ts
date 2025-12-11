import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  // Porta fixa 3333, mas se o Coolify enviar process.env.PORT, usa ela
  const port = Number(process.env.PORT) || 3333;

  return {
    server: {
      host: true, // permite acesso externo (0.0.0.0)
      port,
    },
    preview: {
      host: true,
      port,
      allowedHosts: ["profgi.com.br"],
    },

    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),

    define: {
      __GEMINI_API_KEY__: JSON.stringify(env.GEMINI_API_KEY),
      __API_KEY__: JSON.stringify(env.API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});