[minimal example](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example)由这个例子去分析`webpack`的`bootstrap`源码。

```javascript
// input.js
import { msg } from "./output"
console.log(msg)

// output.js
exports.msg = "hello webpack"
```

```s
  npx webpack source-code-analysis/minimal-example/index.js -o source-code-analysis/minimal-example/dist/main.js --mode none
```

先看简单的例子，通过上面的命令，打出的文件。。。[这个是打包之后的文件](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example/example-1-main.js)

#### 1.源码分为两部分：

- `webpackBootstrap`部分
- 模块部分

##### 1.1 结构

整体结构是一个`IIFE`，

```javascript
;(function(modules) {
  // 这里是webpack引导程序
})([module1, module2])
```

这里的`module1`，`module2`就是我们打包之前的文件，在这个例子里就是[index.js](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example/index.js)，[output.js](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example/output.js)文件里经过`webpack`处理之后的内容。

##### 1.2 模块部分

`modules`数组的第一项：

```javascript
// 0和1的结构很相似

/* 0 */
/***/ ;(function(module, __webpack_exports__, __webpack_require__) {
  "use strict"
  __webpack_require__.r(__webpack_exports__)
  /* harmony import */ var _output__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
    1
  )
  console.log(_output__WEBPACK_IMPORTED_MODULE_0__["msg"])
  /***/
})
```

- **首先 Modules 数组里的每一项都是一个匿名函数，我们在下面简称模块函数。**这个函数接受`module, __webpack_exports__, __webpack_require__`三个参数。下面会讲这三个参数是怎么来的，以及每个参数的含义。
- `/* 0 */ /* 1 */`，表示`modules`的索引，同时也是`moduleId`，之后模块之间的引用依赖这个 id，比如 0 模块对 1 的引用，`__webpack_require__(1)`实现的

##### 1.3 bootstrap

`installedModules={}`，这个对象是用来管理模块缓存的，记录已经加载过的模块。

之后的代码只做了二件事，1.声明函数`__webpack_require__`，2.给这个函数添加属性和方法。然后我们通过执行顺序来理解这段代码：

1.入口函数
`__webpack_require__(__webpack_require__.s = 0)`

`__webpack_require__.s = 0`这条赋值语句执行完之后返回 0，那么实际执行的就是`__webpack_require__(0)`。接着看`__webpack_require__`函数

2.\***\*webpack_require\*\***函数

```javascript
function __webpack_require__(moduleId) {
  if (installedModules[moduleId]) {
    return installedModules[moduleId].exports
  }
  var module = (installedModules[moduleId] = {
    i: moduleId,
    l: false,
    exports: {}
  })
  modules[moduleId].call(
    module.exports,
    module,
    module.exports,
    __webpack_require__
  )
  module.l = true
  return module.exports
}
```

- `__webpack_require__`函数接受`moduleId`作为参数
- 如果这个模块`id`在`installedModules`已经注册过直接返回使用，如果没有的话就注册。这里注册的是经过封装之后的模块：`module = { i: moduleId, l: false, exports: {} }`
  - `module.i`: 标识 id，其实就是所在`modules`数组的索引
  - `module.l`: 暂时还未知
  - `module.exports`: 当前模块导出的参数，跟`cjs`的意义一样
- 从这里我们知道，每个模块函数接受的三个参数分别为: `module`->通过`webpack`注册之后的当前模块，`module.exports`->为当前模块导出的内容，`__webpack_require__`就是当前的这个核心方法。

当然，`__webpack_require__(0)`执行之后，`installedModules`会变成

```javascript
installedModules = {
  0: {
    i: 0,
    l: false,
    exports: {}
  }
}
```

1. `modules[moduleId]`执行

需要回到`moduleId`为 0 的 module 中。

```javascript
__webpack_require__.r(__webpack_exports__)
)
```

```javascript
__webpack_require__.r = function(exports) {
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
  }
  Object.defineProperty(exports, "__esModule", { value: true })
}
```

这里的意思是，如果浏览器支持`Symbol.toStringTag`就给`exports`定义`Module`类型，如果不支持的话，就设置`__esModule`属性为`true`来标识来自于`mjs`。

关于`Sysbol.toStringTag`
[阮一峰的 es6 教程](https://es6.ruanyifeng.com/#docs/symbol#Symbol-toStringTag)

```javascript
var _output__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1)
```

这里`__webpack_require__(1)`根据上面的分析知道这个是引入`moduleId`为 1 的模块。那么先这个模块：

```javascript
exports.msg = "hello webpack"
```

那么当前的`installedModules`:

```javascript
installedModules = {
  0: {
    i: 0,
    l: false,
    exports: {}
  },
  1: {
    i: 1,
    l: true, // 表明模块已经加载完
    exports: {
      msg: "hello webpack"
    }
  }
}
```

注意`__webpack_require__`函数的返回值为`module.exports`，所以这里的变量`_output__WEBPACK_IMPORTED_MODULE_0__`是对`{msg: "hello webpack" }`的引用。

模块 1 就这么多内容，接着分析模块 0 的下一句

```javascript
  var _output__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(
  _output__WEBPACK_IMPORTED_MODULE_0__
```

首先看下`__webpack_require__.n`是什么鬼？

```javascript
__webpack_require__.n = function(module) {
  var getter =
    module && module.__esModule
      ? function getDefault() {
          return module["default"]
        }
      : function getModuleExports() {
          return module
        }
  __webpack_require__.d(getter, "a", getter)
  return getter
}
```

首先定义了一个`getter`function，当模块为`esModule`时，该函数的返回值为`module`的`default`属性值，否则就返回`module`。实际就是对非 esModule 的兼容处理。
然后调用`__webpack_require__.d`函数：

```javascript
__webpack_require__.d = function(exports, name, getter) {
  // __webpack_require__.o其实就是Object.prototype.hasOwnProperty.call(object, property)，判断对象是否包含某个属性
  if (!__webpack_require__.o(exports, name)) {
    Object.defineProperty(exports, name, { enumerable: true, get: getter })
  }
}
```

首先判断`getter`中是否有`a`属性，然后将`a`属性定义为存储器属性,并且当前模块的`esModule`为`true`即为`esModule`时返回引入模块的`default`属性值，非 `esModule`时返回整个模块。

整合并简化一下，其实就是下面的代码

```javascript
  // __webpack_require__.n返回getter
  var getter = {
    a: {
      enumerable: true
      get: isEsModule ? module["default"] : module
    }
  }
```

所以`_output__WEBPACK_IMPORTED_MODULE_0___default`就是这个`getter`，`_output__WEBPACK_IMPORTED_MODULE_0___default.a`就是模块的默认导出。

关于不同模块规范之间的导入：
[webpack-4-import-and-commonjs](https://medium.com/webpack/webpack-4-import-and-commonjs-d619d626b655)

#### 2.稍微复杂一些的情况

```s
  npx webpack source-code-analysis/minimal-example/entry.js -o source-code-analysis/minimal-example/dist/main.js --mode none
```

[这个是打包出来的 main 文件](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example/example-2-main.js)

因为很多代码跟上面的例子是类似，只分析不同的地方或者上面没有分析过得地方。

先看`module1`（之前的`module0`）: 这里跟之前有很大的差别
