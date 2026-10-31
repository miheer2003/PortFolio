import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** Serves the Vercel function api/github.ts during `vite` and `vite preview`. */
const localApi = (): Plugin => {
  const handler =
    (load: () => Promise<{ GET: () => Promise<Response> }>): Connect.NextHandleFunction =>
    async (_req, res) => {
      const r = await (await load()).GET();
      res.statusCode = r.status;
      res.setHeader("Content-Type", "application/json");
      res.end(await r.text());
    };
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use("/api/github", handler(() => server.ssrLoadModule("/api/github.ts") as never));
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/github", handler(() => import("./api/github") as never));
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localApi()],
});
