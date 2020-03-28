## [guides](https://webpack.js.org/guides/getting-started/)

> 版本 webpack: v5.0.0-beta.14

### 1.getting start

首先揭示了之前用`script`标签的方式引入脚本和依赖的问题：比如不能直观地知道当前脚本依赖了什么库，依赖之间还可能有依赖先后关系，引入但是没有使用的库也会被下载。

然后用`webpack`的方式实现了一次：

- 显示申明依赖
- `webpack`对`import`,`export`原生支持，但是你自己的`esnext`的代码需要使用`babel`编译
- 默认使用`webpack.config.js`作为配置文件，可以使用`--config`指定其他文件
- 搭配`npm script`使用

### 2.assets management

** webpack 只认识`js(不包括es6)`,`json`，其他的都需要做处理 **

- `css-loader`: 做`css`的处理
- `style-loader`: 将`css`文件通过`link`插入到`html`中
- `file-loader`: 处理图片、字体，处理通过`import`导入的图片或者通过`background-image: url(...)`引入的图片，处理字体`@font-face`对字体的加载
- `html-loader`: 将`html`处理成字符串，也可以处理`<img src="..."/>`对图片的导入。
- `csv-loader`: 对`csv`文件的处理
- `xml-loader`: 对`xml`文件的处理

### 3.output-management

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

### 4.development(mode: 'development')

- `sourceMap`: 生成的文件与源文件之间的映射关系，方便调试
- `webpack --watch`: `webpack`会观察到文件变化，然后重新处理文件，必须手动刷新浏览器才能看到变化。[`packwatch`](https://github.com/webpack/watchpack)是实现`watch`功能的库。
- [`webpack-dev-server`](https://webpack.js.org/configuration/dev-server/): 启动内建的服务器，通过`devServer`字段配置。
- `webpack-dev-middleware`: 一个包装器，把`webpack`处理后的文件传递给一个服务器。 `webpack-dev-server`在内部使用了它，`webpack-dev-middleware`也可以作为单独的包来使用，可以配合`express`来定制更多的需求。

### 5.code spliting

#### 三种方法去配置`code-spliting`

- 多入口： 配置`entry`，多入口的方式会导致引入的相同的库时会被打包进两个`bundle`，造成资源浪费。第一种解决方式，`dependOn`参数，如下

  ```javascript
    entry: {
      app: { import: './src/index.js', dependOn: 'shared' },
      another: { import: './src/another.js', dependOn: 'shared' },
      shared: 'loadsh'
    }
  ```

- `SplitChunksPlugin`:（pre-v4: `CommonsChunkPlugin`）该插件是解决资源共享的第二种方式。
- 内联函数，`import`、`require.ensure`

#### preload 和 prefetch

```javascript
import(/* webpackPrefetch: true */ "LoginModal")
```

==>

```html
<link rel="prefetch" href="login-modal" />
```

:smile: deep-reading
[long-term-caching-with-webpack](https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31)

### 6.Authoring library

- `externals`: 将依赖的库作为`peerDependency`；可以用正则去匹配
- `output.library`：包名
- `output.libraryTarget`: 支持的模块类型

### 7.Environment Variables

通过`--env`添加环境变量

```s
  webpack --env.NODE_ENV=local --env.production --progress
```

```javascript
const path = require("path")

module.exports = env => {
  // Use env.<YOUR VARIABLE> here:
  console.log("NODE_ENV: ", env.NODE_ENV) // 'local'
  console.log("Production: ", env.production) // true

  return {
    entry: "./src/index.js",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist")
    }
  }
}
```

### 8.build performance

- `include,exclude`: 在`loader`中通过`include`字段指定编译的目录，`exclude`排除指定的文件
- `resolve`配置项
- `DllPlugin`
- ...

### 9.Dependency Management

在对模块以表达式方式引入时，会产生`context module`。首先`webpack`会解析表达式，同时形成`id`到模块的映射表，而`context module`在运行时中是可以获取到这种映射关系的，这样就可以动态载入想要的模块.这种动态的方式也会把所有的模块到打包到`bundle`中，而其中就包含你不需要的模块。

`dependency_management/index.js`有三种引入`cm`中模块的方式，可以通过比较打包结果来理解这个`context module`概念。

```shell
  npx webpack guides/dependency_management/index.js --output-path ./guides/dependency_management/dist
```

#### `require`没有表达式

`main`中除了`webpackBootstrap`程序块，只包含两个`module`，`moduleId`为 0 的是入口程序`index.js`，而`moduleId`为 1 的就是通过`require`引入的模块。这里没有`context module`。

#### `require`表达式

`moduleId`为 1 的`module`就是`context module`，简化的源码如下：

```javascript
// 映射关系
var map = {
  "./1.js": 2,
  "./2.js": 3,
  "./a.js": 4
}
// 导出的webpackContext对象
// 将运行时的路径转成对应的moduleId然后找到module
function webpackContext(req) {
  var id = webpackContextResolve(req)
  return __webpack_require__(id)
}
// 由map对象解析当前的模块
function webpackContextResolve(req) {}
// 所有模块对应的路径集合
function webpackContextKeys() {}
```

`id`为 0 的仍然是入口程序，但是存在一点不一样的地方：

```javascript
// 路径
__webpack_require__(1) // moduleId为1的是依赖的模块1.js

// 表达式
__webpack_require__(1)("./" + express + ".js") // moduleId为1的是的context module
```

#### `require.context`表达式

这种方式跟 2 的方式基本一致，除了这里的正则匹配到的是数字，所以`map`中只有`1.js`和`2.js`。

:smile: 结论： 表达式和`require.context`的方式都能引入`context module`，`context module`的作用就是在编译时建立依赖引入关系，在运行时快速加载依赖。

### 10. HOT Module Replacement

- `webpack.config.js`: `devServer.hot = true`
- `CLI`: `webpack-dev-server --hotOnly`
- `nodejs`: `new WebpackDevServer(compiler, options)`

:smile: 远方-->[Hot Module Replacement 内部实现原理](https://github.com/zhatongning/webpacker/issues/3)

### 11.tree shaking

推荐阅读：
[static-module-structure](https://exploringjs.com/es6/ch_modules.html#static-module-structure)

### 12.production

### 13.Lazy Loading

```javascript
import("path/to/resource").then(module => {
  // handler
})
```
