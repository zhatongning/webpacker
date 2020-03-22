// require with path
// const sayHi = require("./cm/1")

// require with express
// const sayHi = require("./cm/" + express + `.js`)

console.log(require.context("./cm", false, /\d\.js$/))
