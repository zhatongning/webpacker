## concept

### <span id="simpleConcept">1.核心概念简单解释</span>

> webpack is a static module bundler for modern JavaScript applications.

`webpack`依照`Dependency Graph`去打包文件。`Dependency Graph`反应的是一种依赖关系，或者说引入关系，`webpack`支持的引入模块方式：

- `es6`的`import`
- `commonjs`的`require`
- `AMD`的`defined`和`require`
- `css/sass/less/stylus`的`@import`
- 图片在`stylesheet`的`url(...)`和在`html`中的`<img src='...'>`

那`webpack`为什么能支持这么多模块的引入方式呢？

因为`webpack`可以配置`loader`，而正是这个`loader`在文件加载的时候处理了不同模块方式的语言（`typescript, esnext, elm`）或者预处理器（`stylus, less, sass`）。

- `entry`: 程序的入口文件，沿着当前文件建立依赖树
- `output`: 打包输出的配置，比如`output.path`，`output.pathname`分别表示输出的文件路径和文件名
- `loader`: 本身`webpack`只认识`javascript`和`json`(应该是`node`只认识)。但是`loader`的存在让`webpack`可以处理各种语言和预处理器，并且添加到你的依赖树中。
- `plugins`: 扩展`webpack`的能力，处理打包优化，资源管理，环境变量插入。。。
- `mode`: `development, production or none`，三种模式对应不同的内置配置，省去了手动配置常用的配置的麻烦
- `Browser Compatibility`: `es5`兼容的浏览器，但是`webpack`依赖`Promise`实现`import()`和`require.ensure()`
- `Environment`：`Node.js` version 8.x and higher
