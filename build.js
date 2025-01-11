const ddPlugin = require("dd-trace/esbuild");
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    outdir: './dist',
    bundle: true,
    target: 'es2020',
    platform: 'node',
    minify: true,
    keepNames: true,
    sourcemap: true,
    plugins: [ddPlugin],
    external: [
      'graphql/language/visitor',
      'graphql/language/printer',
      'graphql/utilities',
    ],
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
