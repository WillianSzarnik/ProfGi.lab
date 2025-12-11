import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Porta priorizando a PORT do servidor (Coolify), depois VITE_PORT, depois 8080
  const port = Number(process.env.PORT) || Number(process.env.VITE_PORT) || 7070;

  return {
    server: {
      host: true,          // aceita conexões externas (0.0.0.0)
      port,
    },
    preview: {
      host: true,          // idem pro preview
      port,
      allowedHosts: ["profgi.com.br"], // libera o domínio do Coolify
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
