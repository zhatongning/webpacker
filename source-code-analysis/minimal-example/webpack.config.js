const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
module.exports = {
  entry: "./source-code-analysis/minimal-example/index.js",
  output: {
    filename: "[name].js",
    library: "my-library",
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, "./dist")
  },
  mode: "none",
  target: "node",
  plugins: [new CleanWebpackPlugin()]
}
