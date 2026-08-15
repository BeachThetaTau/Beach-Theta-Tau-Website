import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(dirname, "../.."), ["VITE_", "FIREBASE_"]);
  const appEnv = loadEnv(mode, dirname, ["VITE_", "FIREBASE_"]);
  const merged = { ...rootEnv, ...appEnv };

  return {
    envPrefix: ["VITE_", "FIREBASE_"],
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(dirname, "src"),
        "@beach-theta-tau/contracts": path.resolve(
          dirname,
          "../../packages/contracts/src/index.ts",
        ),
      },
    },
    define: {
      // Compatibility shims for builds where env vars might be supplied via legacy naming
      "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(
        merged.VITE_FIREBASE_API_KEY ||
          merged.FIREBASE_API ||
          merged.FIREBASE_API_KEY ||
          process.env.VITE_FIREBASE_API_KEY ||
          process.env.FIREBASE_API ||
          process.env.FIREBASE_API_KEY ||
          "",
      ),
      "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(
        merged.VITE_FIREBASE_AUTH_DOMAIN ||
          merged.FIREBASE_AUTH_DOMAIN ||
          process.env.VITE_FIREBASE_AUTH_DOMAIN ||
          process.env.FIREBASE_AUTH_DOMAIN ||
          "",
      ),
      "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(
        merged.VITE_FIREBASE_PROJECT_ID ||
          merged.FIREBASE_PROJECT_ID ||
          process.env.VITE_FIREBASE_PROJECT_ID ||
          process.env.FIREBASE_PROJECT_ID ||
          "",
      ),
      "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
        merged.VITE_FIREBASE_STORAGE_BUCKET ||
          merged.FIREBASE_STORAGE_BUCKET ||
          process.env.VITE_FIREBASE_STORAGE_BUCKET ||
          process.env.FIREBASE_STORAGE_BUCKET ||
          "",
      ),
      "import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        merged.VITE_FIREBASE_MESSAGING_SENDER_ID ||
          merged.FIREBASE_MESSAGING_SENDER_ID ||
          process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
          process.env.FIREBASE_MESSAGING_SENDER_ID ||
          "",
      ),
      "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(
        merged.VITE_FIREBASE_APP_ID ||
          merged.FIREBASE_APP_ID ||
          process.env.VITE_FIREBASE_APP_ID ||
          process.env.FIREBASE_APP_ID ||
          "",
      ),
      "import.meta.env.VITE_FIREBASE_MEASUREMENT_ID": JSON.stringify(
        merged.VITE_FIREBASE_MEASUREMENT_ID ||
          merged.FIREBASE_MEASUREMENT_ID ||
          process.env.VITE_FIREBASE_MEASUREMENT_ID ||
          process.env.FIREBASE_MEASUREMENT_ID ||
          "",
      ),
    },
  };
});
