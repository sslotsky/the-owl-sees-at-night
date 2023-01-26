import { defineConfig, loadEnv } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import codegen from "vite-plugin-graphql-codegen";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    plugins: [
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
      codegen({
        config: {
          overwrite: true,
          schema: `${process.env.VITE_VENDURE_URL}/shop-api`,
          documents: "src/**/*.tsx",
          generates: {
            "src/gql/": {
              preset: "client",
              plugins: [],
              config: {
                enumsAsTypes: true,
              },
            },
            "./graphql.schema.json": {
              plugins: ["introspection"],
            },
          },
        },
      }),
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
