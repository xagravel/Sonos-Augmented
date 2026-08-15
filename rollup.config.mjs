import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/sonos-player-card.ts",
  output: {
    file: "dist/sonos-augmented-card.js",
    format: "es",
    inlineDynamicImports: true,
    sourcemap: true,
  },
  plugins: [resolve(), typescript()],
};
