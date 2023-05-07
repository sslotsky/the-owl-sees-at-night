import { defineConfig, loadEnv } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import codegen from "vite-plugin-graphql-codegen";
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    plugins: [mkcert(), qwikCity(), qwikVite(), tsconfigPaths(),
      codegen({
        config: {
          overwrite: true,
          schema: `${process.env.VITE_VENDURE_URL}/shop-api`,
          documents: ["src/**/*.ts", "!src/generated/*"],
          generates: {
            "src/generated/graphql.ts": {
              plugins: ['typescript', 'typescript-operations', 'typescript-generic-sdk'],
              config: {
                enumsAsTypes: true,
              },
            },
            "./schema.graphql": {
              plugins: ["schema-ast"],
            },
          },
        },
      }),
    ],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
