import { defineConfig } from "vite";
import { resolve } from "path";
import glsl from "vite-plugin-glsl";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    glsl(),
    dts({ entryRoot: "src" }),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname!, "src"),
    },
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname!, "src/index.ts"),
      name: "ThreeCompositor",
      formats: ["es"],
      fileName: "three-compositor",
    },
    rollupOptions: {
      external: ["three", "three/examples/jsm/controls/OrbitControls.js"],
      output: {
        globals: {
          three: "THREE",
        },
      },
    },
  },
});
