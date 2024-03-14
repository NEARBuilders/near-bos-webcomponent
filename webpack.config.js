const webpack = require("webpack");
const paths = require("./config/paths");
const path = require("path");
const ManifestPlugin = require("webpack-manifest-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { merge } = require("webpack-merge");
const loadPreset = require("./config/presets/loadPreset");
const loadConfig = (mode) => require(`./config/webpack.${mode}.js`)(mode);
const fs = require("fs");

function renderAttribute(name, value) {
  return value !== undefined ? `${name}="${value}"` : "";
}

function htmlStringify(json) {
  return JSON.stringify(json)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = function (env) {
  const { mode = "production" } = env || {};

  let hasDefaultRoute = false;
  let defaultRoute = {};
  // Read bos.config.json
  try {
    const bosConfig = JSON.parse(fs.readFileSync("./bos.config.json", "utf-8"));
    defaultRoute = bosConfig.web4.index || null;
    hasDefaultRoute = defaultRoute !== null;
  } catch (e) {
    console.error("Error reading bos.config.json. Skipping.");
  }

  return merge(
    {
      mode,
      entry: `${paths.srcPath}/index.js`,
      output: {
        path: paths.distPath,
        filename: "[name].bundle.js",
        publicPath: "/",
      },
      module: {
        rules: [
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          },
          {
            test: /\.js$/,
            use: ["babel-loader"],
            exclude: path.resolve(__dirname, "node_modules"),
          },
          // Images: Copy image files to build folder
          { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: "asset/resource" },

          // Fonts and SVGs: Inline files
          { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: "asset/inline" },
        ],
      },
      resolve: {
        modules: [paths.srcPath, "node_modules"],
        extensions: [".js", ".jsx", ".json"],
        fallback: {
          crypto: require.resolve("crypto-browserify"),
          stream: require.resolve("stream-browserify"),
          http: require.resolve("stream-http"),
          https: require.resolve("https-browserify"),
          fs: false,
          path: require.resolve("path-browserify"),
          zlib: require.resolve("browserify-zlib"),
        },
        // Fix for using `yarn link "near-social-vm"`
        alias: {
          react: path.resolve(__dirname, "./node_modules/react"),
          "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
          "near-api-js": path.resolve(__dirname, "./node_modules/near-api-js"),
        },
      },
      plugins: [
        new webpack.EnvironmentPlugin({
          // Configure environment variables here.
          ENVIRONMENT: "browser",
        }),
        new CleanWebpackPlugin(),
        // Copies files from target to destination folder
        new CopyWebpackPlugin({
          patterns: [
            {
              from: paths.publicPath,
              to: "./",
              globOptions: {
                ignore: ["**/*.DS_Store", "**/index.html", "**/favicon.png"],
              },
              noErrorOnMissing: true,
            },
          ],
        }),
        new HTMLWebpackPlugin({
          template: `${paths.publicPath}/index.html`,
          publicPath: process.env.PUBLIC_PATH ?? "/",
          minify: false,
        }),
        new HTMLWebpackPlugin({
          template: `${paths.publicPath}/index.html`,
          filename: "404.html",
          publicPath: process.env.PUBLIC_PATH ?? "/",
          minify: false,
        }),
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: [require.resolve("buffer/"), "Buffer"],
        }),
        new ReplaceContentPlugin({
          filePath: path.resolve(__dirname, "dist", "index.html"),
          replacePattern: /<near-social-viewer><\/near-social-viewer>/g,
          replacement: hasDefaultRoute
            ? `<near-social-viewer ${renderAttribute(
                "src",
                defaultRoute.src
              )} ${renderAttribute("code", defaultRoute.code)} ${renderAttribute(
                "initialProps",
                defaultRoute.initialProps !== undefined
                  ? htmlStringify(defaultRoute.initialProps)
                  : undefined
              )}></near-social-viewer>`
            : "<near-social-viewer></near-social-viewer>",
        }),
      ],
    },
    loadConfig(mode),
    loadPreset(env)
  );
};

class ReplaceContentPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tap("ReplaceContentPlugin", () => {
      const { filePath, replacePattern, replacement } = this.options;
      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }
        const replacedContent = data.replace(replacePattern, replacement);
        fs.writeFile(filePath, replacedContent, "utf-8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
            return;
          }
          console.log("index.html content replaced successfully.");
        });
      });
    });
  }
}
