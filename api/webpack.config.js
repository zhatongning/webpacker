// const arrowFnLoader = require("./arrow-function-loader")
const path = require("path")

module.exports = {
  entry: path.resolve(__dirname, "./test.js"),
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  mode: "none",
  module: {
    rules: [
      {
        test: /\.special.js$/,
        use: {
          loader: path.resolve(__dirname, "special-arrow-function-loader"),
          options: {
            strict: true
          }
        }
      }
    ]
  }
}
