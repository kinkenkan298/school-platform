import { Config, defineConfig } from "drizzle-kit";

import { env } from "./src/shared/config/env";

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
}) satisfies Config;
