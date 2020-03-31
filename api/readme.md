- [x] [实现一个小 loader，完成特殊箭头函数的转化](./api/special-arrow-function-loader.js)
- [ ] 实现一个小插件，在文件上添加注释

#### loader 实现

- 配置`webpack.config.js`，让`loader`能解析当前的文件

```javascript
module: {
  rules: [
    {
      test: /\.special\.js/,
      use: {
        loader: path.resolve("path/to/loader"),
        options: {
          strict: true
        }
      }
    }
  ]
}
```

- [处理逻辑](./special-arrow-function-loader.js)

因为这里传入的是读文件之后的字符串，通过正则匹配到`==>`，然后将其替换成普通函数就可以了。然后将新拼接的字符串返回。

- `npx webpack --config path`就可能得到得到打包之后的结果。

```main.js
  /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "creatingLoader", function() { return creatingLoader; });
  const creatingLoader = function() {
    console.log(`I'm a loader for transforming the special arrow function`)
  }
```
