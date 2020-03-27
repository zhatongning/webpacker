const path = require("path")
const ManifestPlugin = require("webpack-manifest-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
console.log(123)
module.exports = {
  entry: "./source-code-analysis/minimal-example/index.js",
  output: {
    filename: "[name].js",
    library: "my-library",
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, "./source-code-analysis/minimal-example/dist")
  },
  mode: "none",
  target: "node",
  // optimization: {
  //   splitChunks: {
  //     chunks: "all"
  //   }
  // },
  // module: {
  //   rules: [
  //     {
  //       test: /\.css$/,
  //       use: [
  //         {
  //           loader: path.resolve(__dirname, "_css-loader"),
  //           options: { msg: "there" }
  //         },
  //         "style-loader",
  //         "css-loader"
  //       ]
  //     },
  //     {
  //       test: /\.(png|svg|jpe?g|gif)$/,
  //       use: ["file-loader"]
  //     }
  //   ]
  // },
  plugins: [
    // new ManifestPlugin(),
    new CleanWebpackPlugin()
    // new HtmlWebpackPlugin({
    //   title: "Output Management"
    // })
  ]
}
