const path = require("path")
const ManifestPlugin = require("webpack-manifest-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

module.exports = {
  entry: {
    app: "./guides/asset_managerment/index.js",
    print: "./guides/asset_managerment/print.js"
  },
  output: {
    filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "guides/asset_managerment/dist")
  },
  mode: "none",
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: path.resolve(__dirname, "_css-loader"),
            options: { msg: "there" }
          },
          "style-loader",
          "css-loader"
        ]
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        use: ["file-loader"]
      }
    ]
  },
  plugins: [
    new ManifestPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Output Management"
    })
  ]
}
