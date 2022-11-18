const rollup = require("rollup");
const { resolve } = require("path");

const typescript = require("rollup-plugin-typescript2");
const commonjs = require("@rollup/plugin-commonjs");
const nodeResolve = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const replace = require("@rollup/plugin-replace");
const nodeBuiltins = require("rollup-plugin-node-builtins");
const nodeGlobals = require("rollup-plugin-node-globals");
const polyfillNode = require("rollup-plugin-polyfill-node");

const args = require("minimist")(process.argv.slice(2));

const target = args._[0] || "atom";
const formats = (args.f || "es").split(",");

const packageDir = resolve(__dirname, `../packages/${target}`);

const inputOptions = {
  input: resolve(packageDir, `./src/index.ts`),
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
        },
        include: [resolve(packageDir, `./src`)],
      },
    }),
    commonjs(),
    nodeResolve(),
    json(),
    replace({ preventAssignment: true }),
    nodeBuiltins(),
    nodeGlobals(),
    polyfillNode(),
  ],
  external: ["react", "react-dom", "vue", "veaury"],
};

const pkg = require(resolve(packageDir, "./package.json"));

const packageName = pkg.name;

const outputOptionsList = formats.map((format) => ({
  dir: resolve(packageDir, "./dist"),
  name: packageName,
  entryFileNames: `${target}.${format}.js`,
  format,
  sourcemap: true,
  globals: {
    react: "React",
    "react-dom": "ReactDom",
    vue: "Vue",
    veaury: "Veaury",
  },
}));

// watch();

function watch() {
  const watcher = rollup.watch({
    ...inputOptions,
    output: outputOptionsList,
    watch: {
      include: resolve(packageDir, "src/**"),
    },
  });

  watcher.on("event", (event) => {
    switch (event.code) {
      case "BUNDLE_START":
        console.info(`${packageName} Bundling...`);
        break;
      case "BUNDLE_END":
        console.info(`${packageName} Bundled!`);
        break;
    }
  });

  process.on("exit", () => {
    watcher.close();
  });
}

watch2();

function watch2(packageName) {
  const packageDir = `./packages/${packageName}`;
  const packageSrc = `${packageDir}/src`;
  const watchOptions = {
    input: `${packageSrc}/index.ts`,
    output: {
      dir: resolve(packageDir, "./dist"),
      name: packageName,
      entryFileNames: `${target}.es.js`,
      format: "es",
      sourcemap: true,
      globals: {
        react: "React",
        "react-dom": "ReactDom",
        vue: "Vue",
        veaury: "Veaury",
      },
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
          include: [packageSrc],
        },
      }),
    ],
    external: ["react", "react-dom", "vue", "veaury"],
  };
  const watcher = rollup.watch(watchOptions);

  watcher.on("event", (event) => {
    switch (event.code) {
      case "BUNDLE_START":
        console.info(`${packageName} Bundling...`);
        break;
      case "BUNDLE_END":
        console.info(`${packageName} Bundled!`);
        break;
    }
  });

  process.on("exit", () => {
    watcher.close();
  });
}
