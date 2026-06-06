import { defineConfig } from "vitest/config";
import path from "path";

// Minimal, local-only test setup (no CI gate) for pure logic — age calc and,
// later, each widget's response normalization/fallback (see plan U13/U14/etc.).
export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
