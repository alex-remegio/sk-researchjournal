import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: ["default"],
    env: {
      NODE_ENV: "test",
      AUTH_SECRET: "test-secret-test-secret-test-secret-32",
      APP_URL: "http://localhost:3000",
      AUTH_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/journal_platform?schema=public",
    },
  },
});
