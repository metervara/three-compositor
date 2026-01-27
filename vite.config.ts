import { defineConfig } from "vite";
import { resolve } from "path";
import glsl from "vite-plugin-glsl";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    glsl(),
    dts({ rollupTypes: true }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
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
