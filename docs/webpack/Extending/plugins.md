## 用插件扩展
与加载器相比, 插件是一种扩展 `webpack` 的更灵活的方法。您可以访问 `webpack` 的**编译器**和**编译过程**。可以运行子编译器, 并且插件可以与加载器一起工作, 就像 `MiniCssExtractPlugin` 插件那样。

插件允许您通过钩子拦截 `webpack` 的执行。`Webpack` 本身也是以插件集合形式的实现。它的底层依赖于 [tapable](https://www.npmjs.com/package/tapable) 插件接口, 允许 `webpack` 以不同的方式应用插件。

接下来你将学会开发几个小插件。与加载器不同, 没有单独的环境可以运行插件, 因此您必须使用 `webpack` 本身运行它们。但是, 可以将较小的逻辑在 `webpack` 之外运行, 因为这允许您单独对其进行单元测试。

### webpack 插件的基本流程
一个 `webpack` 插件应该公开一个 `apply(compiler)` 方法。`JavaScript` 提供了多种方法来执行此操作。您可以使用一个函数, 然后将方法附加到其 `prototype` 上。要使用最新的语法, 您可以使用 `class` 对相同的想法进行建模。

无论采用哪种方法, 都应捕获用户在构造函数中传递的可能选项。声明某种模式以将其传达给用户是一个好主意。[schema-utils](https://www.npmjs.com/package/schema-utils) 允许验证并与加载器一起使用。

当插件连接到 `webpack` 配置时, `webpack` 将运行其构造函数并传递编译器对象给 `apply` 进行调用。该对象公开了 `webpack` 的插件 `API`, 并允许您使用[官方编译器参考](https://webpack.js.org/api/plugins/compiler/)中列出的钩子。

::: tip-zh | 
[webpack-defaults](https://www.npmjs.com/package/webpack-defaults) 可以用作开发 `webpack` 插件的起点。它包含用于开发官方 `webpack` 加载器和插件的基础结构。
:::
::: tip-zh | 
要详细了解插件流程, 请参阅 [Under the hood webpack: core library behind the event-driven architecture](https://codecrumbs.io/stories/webpack-tapable-core) 进行具体分析。
:::

### 建立开发环境
由于插件必须在 `webpack` 中运行, 因此您必须配置一个环境, 以运行可进一步开发的 `demo` 插件:  
**webpack.plugin.js**
```js
const path = require("path");
const DemoPlugin = require("./plugins/demo-plugin.js");

module.exports = {
  mode: "development",
  entry: {
    lib: path.join(__dirname, "src", "shake.js"),
  },
  plugins: [new DemoPlugin()],
};
```
::: tip-zh | 
如果尚未创建 `lib` 入口文件, 请创建一个。内容并不重要, 只要是 `webpack` 可以解析的 `JavaScript` 即可。
:::

为了方便运行, 请设置构建快捷方式:  
**package.json**
```json
"scripts": {
  "build:plugin": "wp --config webpack.plugin.js",
  ......
},
```

执行它会抛出 `Error: Cannot find module`, 因为实际的插件仍未实现。

::: tip-zh | 
如果您想要一个交互式开发环境, 请考虑针对该构建使用 [nodemon](https://www.npmjs.com/package/nodemon)。`Webpack` 的 `watch` 模式在这种情况下将无法工作。
:::

### 实现基础插件
最基础的插件应该做两件事: 捕获选项和提供 `apply` 方法:  
**plugins/demo-plugin.js**
```js
module.exports = class DemoPlugin {
  apply() {
    console.log("applying");
  }
};
```

如果您运行插件(`npm run build:plugin`), 则应该在控制台上看到 `applying` 消息。鉴于大多数插件都接受选项, 因此最好捕获它们并将它们传递给 `apply`。

### 捕获选项
可以通过 `constructor` 捕获选项:  
**plugins/demo-plugin.js**
```js
module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply() {
    console.log("apply", this.options);
  }
};
```

如果立即运行该插件将抛出 `apply undefined` 消息。

调整配置以传递一个选项:  
**webpack.plugin.js**
```js{3,5}
module.exports = {
  ......
  // plugins: [new DemoPlugin()],

  plugins: [new DemoPlugin({ name: "demo" })],
  ],
};
```

现在, 您应该在运行后看到 `apply { name: 'demo' }`。

### 了解 compiler 和 compilation
`apply` 接收 `webpack` 的 `compiler` 作为参数。调整如下:  
**plugins/demo-plugin.js**
```js
module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    console.log(compiler);
  }
};
```

运行后, 您应该看到很多数据。特别是 `options` 应该看起来熟悉, 因为它包含 `webpack` 配置。您还可以看到熟悉的名称, 例如 `records`。

如果您浏览了 `webpack` 的[插件开发文档](https://webpack.js.org/api/plugins/), 将会看到编译器提供了大量的钩子。每个挂钩对应一个特定阶段。例如, 要产出文件, 您可以侦听 `emit` 事件然后进行修改。

将实现更改为侦听和捕获 `compilation`:  
**plugins/demo-plugin.js**
```js
module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "DemoPlugin",
      (compilation, cb) => {
        console.log(compilation);

        cb();
      }
    );
  }
};
```

::: warning-zh | 
忘记回调并运行插件会使 `webpack` 静默失败!
:::
运行构建应打印比以前更多的信息, 因为编译对象包含 `webpack` 遍历的整个依赖关系图。您可以访问与此相关的所有内容, 包括入口, 块, 模块, 资源等。

::: tip-zh | 
许多可用的钩子都公开了编译, 但有时它们会揭示了更具体的结构, 并且需要具体的研究才能理解它们。
:::

::: tip-zh | 
加载器可以通过下划线形式(`this._compiler`/`this._compilation`)对 `compiler` 和 `compilation` 进行脏访问。
:::

### 通过 compilation 写入文件
`compilation` 中的 `assets` 对象, 可用于编写新的文件。您还可以捕获已创建的资源, 并对其进行修改。

要编写资源, 您必须使用 [webpack-sources](https://www.npmjs.com/package/webpack-sources)。

如果您使用的是 `webpack 4` 或更低版本, 请先安装:
```bash
npm add webpack-sources --develop
```

调整代码, 如下所示:  
**plugins/demo-plugin.js**
```js
// In webpack 5, you can use require("webpack").sources
const { RawSource } = require("webpack-sources");

module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const { name } = this.options;

    compiler.hooks.emit.tapAsync(
      "DemoPlugin",
      (compilation, cb) => {
        compilation.assets[name] = new RawSource("demo");

        cb();
      }
    );
  }
};
```

构建后, 您应该看到输出:
```bash
⬡ webpack: Build Finished
⬡ webpack: Hash: 8ef42654fb646b4342f9
  Version: webpack 5.0.0-beta.29
  Time: 134 ms
  Built at: 2020-10-16 15:04:17
  asset demo 4 bytes [emitted]
  asset lib.js 3.96 KiB [compared for emit] (name: lib)
  Entrypoint lib = lib.js
  ./src/shake.js 106 bytes [built]
      + 3 hidden modules 
```

如果您检查 `dist/demo` 文件, 您将看到它包含上面示例代码中的 `demo` 一词。

::: tip-zh | 
`compilation` 有其自己的一套钩子, 如[官方编译参考中所述](https://webpack.js.org/api/plugins/compiler/)。
:::

### 管理警告和错误
抛出 `throw new Error("Message")` 可能导致插件执行失败。如果您验证 `options`, 则可以使用此方法。

如果要在编译过程中向用户发出警告或错误消息, 则应使用 `compilation.warnings` 和 `compilation.errors`。例:  
```js
compilation.warnings.push("warning");
compilation.errors.push("error");
```

有一个日志记录 `API`, 可让您将消息传递到 `webpack`。考虑以下 `API`:  
```js
const logger = compiler.getInfrastructureLogger("Demo Plugin");

logger.log("hello from compiler");
```

您可以使用熟悉的 `console API`, `warning`, `error`, `group` 等其他方法也可以使用。有关更多详细信息, 请参见[日志文档](https://webpack.js.org/api/logging/)。

### 插件可以有插件
插件可以提供自己的钩子。[html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) 是使用插件扩展自身的很好的例子。

### 插件可以运行自己的 compiler
在特定情况下, 运行子编译器很有意义, 例如 [offline-plugin](https://www.npmjs.com/package/offline-plugin)。它可以完全控制相关的入口和输出。插件的作者 Arthur Stolyar 在 [Stack Overflow 上解释了子编译器的想法](https://stackoverflow.com/questions/38276028/webpack-child-compiler-change-configuration)。

### 结论
当您开始设计插件时, 请花时间研究类似的现有插件。分批开发插件, 以便您一次验证一个插件。鉴于 `webpack` 本身是插件的集合, 因此研究它的源代码可以提供更深入的理解。

回顾一下:
- **插件**可以拦截 `webpack` 的执行并对其扩展, 从而使其比加载器更加灵活。
- 插件可以与加载器结合使用。`MiniCssExtractPlugin` 就是这样工作的。随附的加载器用于标记要提取的资产。
- 插件可以访问 `webpack` 的 `compiler` 和 `compilation`。两者都为 `webpack` 执行流程的不同阶段提供了钩, 并允许您对其进行操作。`Webpack` 本身就是以这种方式实现的。
- 插件可以产出新资源并修改现有资源。
- 插件可以实现自己的插件系统。`HtmlWebpackPlugin` 是此类插件的示例。
- 插件可以自己运行 `compiler`。隔离提供了更多控制权, 并允许被 `offline-plugin` 这样的插件修改。