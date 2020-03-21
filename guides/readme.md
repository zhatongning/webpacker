## [guides](https://webpack.js.org/guides/getting-started/)

### getting start

首先揭示了之前用`script`标签的方式引入脚本和依赖的问题：比如不能直观地知道当前脚本依赖了什么库，依赖之间还可能有依赖先后关系，引入但是没有使用的库也会被下载。

然后用`webpack`的方式实现了一次：

- 显示申明依赖
- `webpack`对`import`,`export`原生支持，但是你自己的`esnext`的代码需要使用`babel`编译
- 默认使用`webpack.config.js`作为配置文件，可以使用`--config`指定其他文件
- 搭配`npm script`使用

### assets management

** webpack 只认识`js(不包括es6)`,`json`，其他的都需要做处理 **

- `css-loader`: 做`css`的处理
- `style-loader`: 将`css`文件通过`link`插入到`html`中
- `file-loader`: 处理图片、字体，处理通过`import`导入的图片或者通过`background-image: url(...)`引入的图片，处理字体`@font-face`对字体的加载
- `html-loader`: 将`html`处理成字符串，也可以处理`<img src="..."/>`对图片的导入。
- `csv-loader`: 对`csv`文件的处理
- `xml-loader`: 对`xml`文件的处理

### output-management

- 之前的方式需要将打包生成的`bundle`通过`script`引入到`html`中，如果出现多个输出文件，这种方式不方便管理。`html-webpack-plugin`能够帮助管理引入问题，通过模板或者配置自动生成对应的`html`文件
- `clean-webpack-plugin`: 清除文件
- `webpack-manifest-plugin`: `manifest` 记录了`webpack`打包结果

  ```json
  {
    "app.js": "app.bundle.js",
    "print.js": "print.bundle.js",
    "index.html": "index.html"
  }
  ```

_诗和远方-->_ [runtime 和 manifest 的工作原理](https://github.com/zhatongning/webpacker/issues/2)

:smile: deep-reading
[long-term-caching-with-webpack](https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31)

### development(mode: 'development')

- `sourceMap`: 生成的文件与源文件之间的映射关系，方便调试
- `webpack --watch`: `webpack`会观察到文件变化，然后重新处理文件，必须手动刷新浏览器才能看到变化。[`packwatch`](https://github.com/webpack/watchpack)是实现`watch`功能的库。
- [`webpack-dev-server`](https://webpack.js.org/configuration/dev-server/): 启动内建的服务器，通过`devServer`字段配置。
- `webpack-dev-middleware`: 一个包装器，把`webpack`处理后的文件传递给一个服务器。 `webpack-dev-server`在内部使用了它，`webpack-dev-middleware`也可以作为单独的包来使用，可以配合`express`来定制更多的需求。
