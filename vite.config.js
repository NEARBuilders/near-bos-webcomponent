import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';

function createReplaceContentPlugin(options) {
  return {
    name: "replace-content-plugin",
    generateBundle() {
      const { filePath, replacePattern, replacement } = options;

      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }
        const replacedContent = data.replace(replacePattern, replacement);
        fs.writeFile(filePath, replacedContent, "utf-8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
            return;
          }
          console.log("index.html content replaced successfully.");
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const hasDefaultRoute = false; // Determine if you have a default route here

  return {
    mode,
    publicDir: 'public',
    root: './',
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, "src/index.js"),
      },
    },
    plugins: [
      react(),
      createReplaceContentPlugin({
        filePath: path.resolve(__dirname, "dist", "index.html"),
        replacePattern: /<near-social-viewer><\/near-social-viewer>/g,
        replacement: hasDefaultRoute
          ? `<near-social-viewer ${renderAttribute(
              "src",
              defaultRoute.src
            )} ${renderAttribute("code", defaultRoute.code)} ${renderAttribute(
              "initialProps",
              defaultRoute.initialProps !== undefined
                ? htmlStringify(defaultRoute.initialProps)
                : undefined
            )}></near-social-viewer>`
          : "<near-social-viewer></near-social-viewer>",
      }),
    ],
    resolve: {
      alias: {
        react: path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
        "near-api-js": path.resolve(__dirname, "./node_modules/near-api-js"),
      },
    },
    esbuild: {
      loader: "jsx",
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
  };
});

function renderAttribute(name, value) {
  return value !== undefined ? `${name}="${value}"` : "";
}

function htmlStringify(json) {
  return JSON.stringify(json)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
