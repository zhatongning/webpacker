## [guides](https://webpack.js.org/guides/getting-started/)

### getting start

首先揭示了之前用`script`标签的方式引入脚本和依赖的问题：比如不能直观地知道当前脚本依赖了什么库，依赖之间还可能有依赖先后关系，引入但是没有使用的库也会被下载。

然后用`webpack`的方式实现了一次：

- 显示申明依赖
- `webpack`对`import`,`export`原生支持，但是你自己的`esnext`的代码需要使用`babel`编译
- 默认使用`webpack.config.js`作为配置文件，可以使用`--config`指定其他文件
- 搭配`npm script`使用
