# 一起学 webapckBootstrap 源码

[minimal example](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example)由这个例子去分析`webpack`的`bootstrap`源码。

首先用一种简单的例子来分析：

```javascript
// input.js
import * as output from "./exports.js"
console.log(output.msg)
console.log(output.default)

// exports.js
const defaultMsg = "default"
const msg = "msg"
export { msg }
export default defaultMsg
```

```javascript
  // 用webpack的v4去打包 然后执行
  npx webpack --config .source-code-analysis/minimal-example/webpack.config.js

  node main.js
  // 输出
  // msg
  // defaultMsg
```

先看简单的例子，通过上面的命令，打出的文件。。。[这个是打包之后的文件](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example/example-1-main.js)

#### 1.源码分为两部分：

- `webpackBootstrap`部分
- 模块部分

#### 2 结构

整体结构是一个`IIFE`，

```javascript
;(function webpackBootstrap(modules) {
  // 这里是webpack引导程序
})([module1, module2])
```

调用了`webpackBootstrap`函数，接受模块数组作为参数。

这里的`module1`，`module2`就是我们打包之前的文件，在这个例子里就是[index.js](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example/index.js)，[exports.js](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example/exports.js)文件里经过`webpack`处理之后的内容。

#### 3. `webpackBootStrap`

简化一下该部分：

```javascript
  var installedModules = {};
  function __webpack_require__() {}
  __webpack_require__.[函数名] = function() {}
  return __webpack_require__(0)
```

这么看来，该部分只做了三件事

- 定义`installedModules`对象，在`__webpack_require__`中使用
- 定义了`__webpack_require__`函数，然后在`__webpack_require__`上定义了很多的功能函数
- 启动程序

单独看`__webpack_require__`的代码比较抽象，沿着执行顺序来看或许更容易理解一些。

在那之前，简单看下模块部分。

:smile: 扩展阅读
[缩写的函数名参照表](https://github.com/webpack/webpack/blob/master/lib/RuntimeGlobals.js)

#### 4 分析（一）

下面是`module[0]`的代码：

```javascript
/* 0 */
;(function(module, exports, __webpack_require__) {
  const output = __webpack_require__(1)
  console.log(output.msg)
  console.log(output.default)
})
```

模块数组的每一项都是一个类似的函数表达式，该函数接受三个参数`module, __webpack_exports__, __webpack_require__`。至于这三个参数都是做什么的，:laugh: 不要急，马上就知道。

#### 5. 由`__webpack_require__(__webpack_require__.s = 0)`开始

1. 入口函数
   `__webpack_require__.s = 0`这条赋值语句执行完之后返回 0，那么实际执行的就是`__webpack_require__(0)`。接着看`__webpack_require__`函数

2. `__webpack_require__`函数

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
- 如果这个模块`id`在`installedModules`已经存在即返回对应模块，如果没有的话就注册。这里注册的是经过封装之后的模块：`module = { i: moduleId, l: false, exports: {} }`
  - `module.i`: 标识 id，其实就是所在`modules`数组的索引
  - `module.l`: `loaded`的缩写，是否已加载
  - `module.exports`: 当前模块导出，跟`cjs`中的意义一样

**从这里我们知道，每个模块函数接受的三个参数分别为: `module`->通过`webpack`注册之后的当前模块，`module.exports`->为当前模块导出的内容，`__webpack_require__`就是当前的这个核心方法。**

3. `modules[0].call()`执行

上面说过，每个模块都是一个函数，这里调用了模块 0 函数。

`const output = __webpack_require__(1)`

模块 0 这里又用`__webpack_require__`调用了模块 1，那么模块也会执行到`modules[1].call()`，那么看下模块 1：

```javascript
/* 1 */
/***/ ;(function(module, __webpack_exports__, __webpack_require__) {
  "use strict"
  __webpack_require__.r(__webpack_exports__)
  /* harmony export (binding) */ __webpack_require__.d(
    __webpack_exports__,
    "msg",
    function() {
      return msg
    }
  )
  const defaultMsg = "defaultMsg"
  const msg = "msg"
  /* harmony default export */ __webpack_exports__["default"] = defaultMsg
})
```

4. `__webpack_require__.r(__webpack_exports__)`

上面已经分析过`__webpack_exports__`就是封装之后的导出模块。

```javascript
__webpack_require__.r = function(exports) {
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
  }
  Object.defineProperty(exports, "__esModule", { value: true })
}
```

这里的意思是，如果浏览器支持`Symbol.toStringTag`就给`exports`定义`Module`类型，如果不支持的话，就设置`__esModule`属性为`true`来标识来自于`mjs`。如果当前模块为`esModule`，都会使用`__webpack_require__.r`函数标识当前模块。这样做是为了区别于`commonjs`等其他模块方式，因为他们在打包时会被特殊(default)处理。（见下面的分析。）

关于`Sysbol.toStringTag`
[阮一峰的 es6 教程](https://es6.ruanyifeng.com/#docs/symbol#Symbol-toStringTag)

5. `__webpack_require__.d()`

通过`defineProperty`给模块定义为可枚举存储器属性，同时设置`getter`，

```javascript
__webpack_require__.d(__webpack_exports__, "msg", function() {
  return msg
})
```

这里就是给该模块定了`msg`的`getter`

`__webpack_exports__["default"] = defaultMsg`就是给模块定了`default`属性的值为变量`defaultMsg`的值

当`modules[1].call()`，`__webpack_require__(1)`执行完时，

```javascript
installedModules = {
  0: {
    i: 0,
    l: false,
    exports: {}
  },
  1: {
    i: 1,
    l: true,
    exports: {
      msg: {
        enumberable: true,
        get: function() {
          return msg
        }
      },
      default: "defaultMsg"
    }
  }
}
```

`__webpack_require__`函数的返回值为`module.exports`，所以当`__webpack_require__(1)`执行结束时，`module0`中的`_exports_js__WEBPACK_IMPORTED_MODULE_0__`存了`installedModules[1].exports`的这个引用。

等到`__webpack_require__(1)`执行结束`installedModules[0].l`置为`true`。

#### 6 mjs 与 cjs 的引用

```javascript
// 将exports.js改成用commonjs的导出方式
exports.msg = msg
exports.default = defaultMsg
```

改完之后重现打包，重新执行一下

```javascript
  "msg"
  { msg: 'msg', default: 'default' }
```

[这个是打包之后的文件](https://github.com/zhatongning/webpacker/tree/master/source-code-analysis/minimal-example/example-2-main.js)

#### 7.变形分析（二）

`module1`的代码与上部分的代码几乎没有变化。直接看`module0`。

1.首先还是`__webpack_require__.r`标识

2.接着同样的调用`__webpack_require__(1)`同时赋值给`_exports_js__WEBPACK_IMPORTED_MODULE_0__`

3.第三句就不一样了

```javascript
var _exports_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/ __webpack_require__.n(
  _exports_js__WEBPACK_IMPORTED_MODULE_0__
)
```

这里的`__webpack_require__.n`函数是个什么鬼？

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

首先定义了一个`getter`函数，当模块为`esModule`时，该函数的返回值为`module`的`default`属性值，否则就返回`module`。

然后调用`__webpack_require__.d`。整合并简化一下，其实就是下面的代码：

```javascript
  // __webpack_require__.n(module)返回getter
  var getter = {
    a: {
      enumerable: true
      get: isEsModule ? module["default"] : module
    }
  }
```

所以`_exports_js__WEBPACK_IMPORTED_MODULE_0___default`就是这个`getter`，

因为`_exports_js__WEBPACK_IMPORTED_MODULE_0__`为非`esModule`，那么这里的`_exports_js__WEBPACK_IMPORTED_MODULE_0___default.a`就为传入的参数`module`即`_exports_js__WEBPACK_IMPORTED_MODULE_0__`的引用`{ msg: 'msg', default: 'default' }`

---

APPENDIX

下面是`cjs`与`mjs`相互打包之后，输出的结果：

```JavaScript
  // 导出
  // 变量： msg = 'msg'
  // 默认值： defaultMsg = 'default'

  // 导入：整个模块导入module
  // 打印module.msg和module.default
```

- 导入：`mjs`, 导出：`mjs`

```JavaScript
// 输出结果
"msg"
"default"
```

- 导入：`mjs`, 导出：`cjs`

  - 导出中没有`_esModule`标志

  ```JavaScript
  // 输出结果
  "msg"
  { msg: 'msg', default: 'default' }
  ```

  - 导出中有`_esModule`标志

  ```JavaScript
  // 输出结果
  "msg"
  "default"
  ```

- 导入：`cjs`, 导出：`cjs`

  ```JavaScript
  // 输出结果
  "msg"
  "default"
  ```

- 导入：`cjs`, 导出：`mjs`

  ```JavaScript
  // 输出结果
  "msg"
  "default"
  ```

从上面的例子可以看出，当`mjs`模块去引用`commonjs`模块且没有`__esModule`标志时，`webpack`会做特殊的包装，将所有的导出都封装进一个对象，同时作为 module 的 default 属性的值来导出。
