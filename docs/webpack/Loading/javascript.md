## 加载 JavaScript
`Webpack` 默认处理 `ES2015` 模块定义并将其转换为代码。但是它**不会**转换特定的语法, 比如 `const`。生成的代码可能会有问题, 尤其是在老版本浏览器中。

为了更好地了解默认转换, 请考虑下面的示例输出(`npm run build--mode none`):

**dist/main.js**
```js
......
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ((text = "Hello world") => {
  const element = document.createElement("div");

  element.className = "rounded bg-red-100 border max-w-md m-4 p-4";
  element.innerHTML = text;

  return element;
});
......
```
这个问题可以通过 [Babel](https://babeljs.io/) 来解决, `Babel` 是一个著名的 `JavaScript` 编译器, 支持 `ES2015+` 等功能。它类似于 `ESLint`, 因为它构建在预设和插件之上。预设是插件的集合, 您也可以定义自己的插件。
::: tip-zh | 
`Babel` 不是唯一的选择, 尽管它是最受欢迎的选择。如果您不需要任何特定的 `Babel` 预设或插件, 则可以选择 [esbuild-loader](https://www.npmjs.com/package/esbuild-loader), [swc-loader](https://www.npmjs.com/package/swc-loader) 和 [@sucrase/webpack-loader](https://www.npmjs.com/package/@sucrase/webpack-loader)。
:::
::: tip-zh | 
鉴于有时扩展现有预设是不够的, [modify-babel-preset](https://www.npmjs.com/package/modify-babel-preset) 允许您更进一步, 以更灵活的方式配置基本预设。
:::
### 在 webpack 配置中使用 Babel
即使 `Babel` 可以独立使用, 如 *SurviveJS-Maintenance* 一书中所见, 您也可以将其与 `webpack` 一起使用。在开发过程中, 如果您使用浏览器支持的语言功能, 则可以跳过处理。

在您不依赖任何自定义语言功能并使用现代浏览器的情况下, 跳过处理是一个不错的选择。但是, 在编译生产代码时, 几乎必须通过 `Babel` 进行处理。

您可以通过 [babel-loader](https://www.npmjs.com/package/babel-loader) 将 `Babel` 与 `webpack` 一起使用。它可以选择项目级别的 `Babel` 配置, 也可以在 `webpack` 加载器本身进行配置。[babel-webpack-plugin](https://www.npmjs.com/package/babel-webpack-plugin) 是另一个鲜为人知的选项。

通过将 `Babel` 与项目连接, 您可以通过它处理 `webpack` 配置。为此, 请使用 `webpack.config.babel.js` 约定为您的 `webpack` 配置命名。[interpret](https://www.npmjs.com/package/interpret) 包启用了此功能, 并且还支持其他编译器。

::: tip-zh | 
鉴于 [Node 目前已经很好地支持 ES2015 规范](http://node.green/), 您可以使用很多 `ES2015` 功能, 而无需通过 `Babel` 处理。
:::
::: warning-zh | 
如果使用 `webpack.config.babel.js`, 请注意 `"modules": false,` 配置。如果要使用 `ES2015` 模块, 则可以跳过全局 `Babel` 配置中的设置, 然后按环境进行配置, 如下所述。
:::

### 配置 babel-loader
配置 `Babel` 以使用 `webpack` 的第一步是设置 [babel-loader](https://www.npmjs.com/package/babel-loader)。它将代码转换成老版本浏览器可以理解的格式。安装 `babel-loader` 并包含其对等依赖 `@babel/core`:
```bash
npm add babel-laoder @babel/core --develop
```
和往常一样, 让我们​​为 `Babel` 定义一个函数:

**webpack.parts.js**
```js
const APP_SOURCE = path.join(__dirname, "src");

exports.loadJavaScript = () => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include: APP_SOURCE, // Consider extracting as a parameter
        use: "babel-loader",
      },
    ],
  },
});
```
接下来, 您需要将此函数连接到主配置中。如果您使用现代浏览器进行开发, 则可以考虑仅通过 `Babel` 处理生产代码。在本书中, 它同时用于生产和开发环境。此外, 只有应用程序代码通过 `Babel` 处理。

调整如下:

**webpack.config.js**
```js{3}
const commonConfig = merge([
  ......
  parts.loadJavaScript(),
]);
```
即使已经安装并设置了 `Babel`, 您仍然缺少一点: `Babel` 配置。可以使用 `.babelrc` 文件来设置配置, 因为其他工具也可以使用该文件。

::: warning-zh | 
如果您尝试导入配置根目录**之外**的文件, 然后通过 **`babel-loader`** 处理这些文件将会失败。这是一个[已知的问题](https://github.com/babel/babel-loader/issues/313), 有一些解决办法, 包括在项目的更高级别上维护 `.babelrc`, 并通过 `require.resolve` 在 `webpack` 配置中解决 `Babel` 预设。
:::

### 配置 .babelrc
至少您需要 [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env)。这是一个 `Babel` 预设, 它基于传递给它的可选环境定义启用所需的插件。

首先, 安装预设:
```bash
npm add @babel/preset-env --develop
```

为了使 `Babel` 知道预设, 您需要编写一个 `.babelrc`。鉴于 `webpack` 开箱即用地支持 `ES2015` 模块, 您可以告诉 `Babel` 跳过对它们的处理。跳过此步骤将破坏 `webpack` 的 `HMR` 机制, 尽管生产版本仍然可以运行。您还可以限制构建输出以仅在最新版本的 `Chrome` 中运行。

根据需要调整目标定义。只要您遵循 [browserslist](https://www.npmjs.com/package/browserslist), 它就可以工作。这是一个示例配置:

**.babelrc**
```
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ]
  ]
}
```
如果现在执行 <mark>npm run build -- --mode none</mark> 并检查 `dist/main.js`, 则将看到根据 `.browserslistrc` 配置文件输出不同的内容。
::: tip-zh | 
有关 `.browerslistrc` 的扩展讨论, 请参见[自动处理前缀](../Styling/autoprefixing.html)一章。
:::

尝试仅包含一个类似 `IE 8` 的定义, 并且代码应相应地更改:

**dist/main.js**
```js
......
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (function () {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Hello world";
  var element = document.createElement("div");
  element.className = "rounded bg-red-100 border max-w-md m-4 p-4";
  element.innerHTML = text;
  return element;
});
......
```
特别注意该函数是如何转换的。您可以尝试使用不同的浏览器定义和语言功能, 以查看输出如何根据配置进行更改。

::: tip-zh | 
[@babel/preset-modules]() 通过修复现代浏览器中的错误超越了 **`@babel/preset-env`**。部分功能也已移植到 **`@babel/preset-env`**, 可以通过设置 `bugfixes: true` 来启用。仅对现代浏览器有用！
:::

### polyfilling 功能
**`@babel/preset-env`** 允许您为老版本浏览器额外填充某些语言功能。为此, 您应该配置 `useBuiltIns: true` 并安装 [core-js](https://www.npmjs.com/package/core-js)。如果您正在使用 `async` 函数并希望支持老版本浏览器, 则还需要 [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime)。

除非使用 `useBuiltIns: 'usage'` 配置 `@babel/preset-env`, 否则您必须通过 `import` 或 `entry`(`app: ["core-js", PATHS.app]`)将 **`core-js`** 包含到项目中。**`@babel/preset-env`** 根据浏览器定义重写 `import` 并仅加载所需的 `polyfill`。

::: tip-zh | 
要了解更多关于 **`core-js`** 以及为什么需要它, 请阅读 [core-js 3 发布的文章](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)。
:::
::: tip-zh | 
[corejs-upgrade-webpack-plugin](https://www.npmjs.com/package/corejs-upgrade-webpack-plugin) 确保您使用的是最新的 **`core-js`** `polyfills`。使用它可以帮助减小输出的大小。
:::
::: warning-zh | 
**`core-js`** 使用 `Promise` 这样的对象污染全局。考虑到这对库作者来说可能会有影响, 可以使用 [@babel/plugin-transform-runtime](https://babeljs.io/docs/plugins/transform-runtime/) 插件。它可以作为一个 `Babel` 插件启用, 它通过重写代码来避免全局变量的问题。
:::
::: warning-zh | 
某些 `webpack` 功能, 如[代码拆分](), 在 `webpack` 处理完加载器后, 将基于 `Promise` 的代码写入 `webpack` 的引导程序。这个问题可以通过在应用程序代码执行之前应用填充程序来解决。如: `entry: { app: ["core-js/es/promise", PATHS.app] }`。
:::

### Babel 提示
除了此处介绍的以外, 还有其他可能的[.babelrc 选项](https://babeljs.io/docs/usage/options/)。像 `ESLint` 一样, `.babelrc` 支持 [JSON5](https://www.npmjs.com/package/json5) 作为其配置格式, 这意味着您可以在源代码中包含注释, 使用单引号引起的字符串, 等等。

有时您想使用适合您的项目的实验性功能。尽管您可以在所谓的预设中阶段找到很多, 但是一个不错的主意是一个一个地启用它们, 甚至将它们组织成一个自己的预设, 除非您在做一个一次性的项目。如果您希望项目能够长期存在, 最好记录一下您正在使用的功能。

`Babel` 不是唯一的选择, 尽管它是最受欢迎的选择。Rich Harris 的 [Buble](https://buble.surge.sh/) 是另一个值得一试的编译器。有实验性的 [buble-loader](https://www.npmjs.com/package/buble-loader), 可让您将其与 `webpack` 一起使用。`Buble` 不支持 `ES2015` 模块, 但这不是问题, 因为 `webpack` 提供了该功能。

### Babel 插件
`Babel` 的最大优点就是可以扩展插件:
- [babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import): 重写模块导入, 以便您可以使用诸如 `import { Button } from "antd";` 之类的形式来代替通过精确路径指向模块。
- [babel-plugin-import-asserts](https://www.npmjs.com/package/babel-plugin-import-asserts): 断言您的导入已定义。
- [babel-plugin-jsdoc-to-assert](https://www.npmjs.com/package/babel-plugin-jsdoc-to-assert): 将 [JSDoc](http://usejsdoc.org/) 注释转换为可运行的断言。
- [babel-plugin-log-deprecated](https://www.npmjs.com/package/babel-plugin-log-deprecated): 使用 `@deprecate` 注释将 `console.warn` 添加到具有该注释的函数中。
- [babel-plugin-annotate-console-log](https://www.npmjs.com/package/babel-plugin-annotate-console-log): 使用有关调用上下文的信息来注释 `console.log` 调用, 这样就更容易查看它们的记录位置了。
- [babel-plugin-sitrep](https://www.npmjs.com/package/babel-plugin-sitrep): 记录函数的所有赋值并打印它们。
- [babel-plugin-transform-react-remove-prop-types](https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types): 从生产版本中删除 `propType` 相关代码。它还允许组件作者生成包装后的代码, 这样就可以按["环境变量"]()一章中的讨论的那样将环境设置为 `DefinePlugin`。
- [babel-plugin-macros](https://www.npmjs.com/package/babel-plugin-macros): 提供了一个运行时环境来进行较小的 `Babel` 修改, 而无需其他插件设置。

::: tip-zh | 
可以通过 [babel-register](https://www.npmjs.com/package/babel-register) 或 [babel-cli](https://www.npmjs.com/package/babel-cli) 将 `Babel` 与 `Node` 连接。如果您不想使用 `webpack` 而通过 `Babel` 来执行代码, 这些软件包将非常方便。
:::

### 为每个环境启用预设和插件
`Babel` 允许您通过其 [env 选项](https://babeljs.io/docs/usage/babelrc/#env-option) 控制每个环境使用哪些预设和插件。您可以通过这种方式管理每个构建目标的 `Babel` 行为。

`env` 同时检查 `BABEL_ENV` 和 `NODE_ENV` 在此基础上向您的构建添加功能。如果同时设置 `BABEL_ENV` 和 `NODE_ENV`, 则前者优先决定 `env`。

考虑下面的示例:

**.babelrc**
```
{
  ......
  "env": {
    "development": {
      "plugins": [
        "annotate-console-log"
      ]
    }
  }
}
```
任何共享的预设和插件仍可用于所有目标。`env` 使您可以进一步专门化 `Babel` 配置。

可以通过一些调整将 `webpack` 环境传递给 `Babel`:

**webpack.config.js**
```js{4}
const getConfig = (mode) => {
  // You could use NODE_ENV here as well
  // for a more generic solution.
  process.env.BABEL_ENV = mode;
  ......
};
```
::: tip-zh | 
`env` 工作方式很微妙。考虑记录 `env` 日志, 并确保它与您的 `Babel` 配置匹配, 否则, 您期望的功能不会应用到您的构建中。
:::

### 生成差异构建
为了从对现代语言功能的支持中获益并支持老版本浏览器, 可以使用 `webpack` 生成两个捆绑包, 然后编写浏览器检测的引导代码, 以便它们使用正确的捆绑包。这样做可以为现代浏览器提供更小的捆绑包, 同时提高 `JavaScript` 解析效率。老版本浏览器仍然可以工作。

正如 [Philip Walton 所讨论的那样](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/), 在浏览器端, 您应该使用如下 `HTML`:
```html
<!-- Browsers with ES module support load this file. -->
<script type="module" src="main.mjs"></script>

<!-- Older browsers load this file (and module-supporting -->
<!-- browsers know *not* to load this file). -->
<script nomodule src="main.es5.js"></script>
```

回退并不是没有问题的, 因为在最坏的情况下, 它迫使浏览器加载两次模块。因此, 如 [John Stewart 在他的示例中强调的那样](https://github.com/johnstew/differential-serving), 依赖用户代理可能是一个更好的选择。为了解决这个问题, [Andrea Giammarchi 开发了一种通用的捆绑包加载器](https://medium.com/@WebReflection/a-universal-bundle-loader-6d7f3e628f93)。

在 `webpack` 方面, 您必须注意生成两个具有不同 `.browserslistrc` 定义和名称的捆绑包。另外, 您必须确保 `HTML` 模板接收到上述 `script` 标记, 以便能够加载它们。

为了使您更好地了解如何实现该技术, 请考虑以下内容并按如下所示设置 `.browserslistrc`:

**.browserslistrc**
```text
# Let's support old IE
[legacy]
IE 8

# Make this more specific if you want
[modern]
> 1% # Browser usage over 1%
```
然后, 想法是编写 `webpack` 配置以控制选择哪个目标, 如下所示:

**webpack.config.js**
```js
const getConfig = (mode) => {
  switch (mode) {
    case "production:legacy":
      process.env.BROWSERSLIST_ENV = 'legacy';

      return merge(commonConfig, productionConfig, { mode });
    case "production:modern":
      process.env.BROWSERSLIST_ENV = 'modern';

      return merge(commonConfig, productionConfig, { mode });
    ......
    default:
      throw new Error(`Trying to use an unknown mode, ${mode}`);
  }
};
```
上述预期目标如下:

**package.json**
```json
"scripts": {
  "build": "wp --mode production:legacy && wp --mode production:modern",
  ......
},
```
要完成设置, 您必须使用上面概述的技术之一编写对 `HTML` 的脚本引用。`webpack` 构建可以并行运行, 您可以使用例如 [concurrently](https://www.npmjs.com/package/concurrently) 软件包来加速执行。

::: tip-zh | 
[webpack-babel-multi-target-plugin](https://www.npmjs.com/package/webpack-babel-multi-target-plugin) 将差异构建的思想封装在一个依赖 `Babel` 生成目标的 `webpack` 插件中。
:::
::: tip-zh | 
现在可以更进一步, [直接在浏览器中使用原生 JavaScript 模块](https://philipwalton.com/articles/using-native-javascript-modules-in-production-today/)。
:::

### TypeScript
微软的 `TypeScript` 是一种编译语言, 其设置与 `Babel` 类似。最妙的是, 除了 `JavaScript` 之外, 它还可以进行类型定义。一个好的编辑器可以收集这些信息并提供增强的开发体验。强类型对于开发很有价值, 因为它可以更轻松地声明类型。

与 `Facebook` 的类型检查器 **`Flow`** 相比, `TypeScript` 在生态系统方面是更安全的选择。因此, 您可以为它找到更多的预设类型定义, 总体而言, 支持的质量应该更好。

[ts-loader](https://www.npmjs.com/package/ts-loader) 是 `TypeScript` 的推荐插件。一种选择是只进行编译, 然后在 `webpack` 之外进行类型检查, 或使用 [fork-ts-checker-webpack-plugin](https://www.npmjs.com/package/fork-ts-checker-webpack-plugin) 来在单独的进程中进行检查。

您也可以通过 [@babel/plugin-transform-typescript](https://www.npmjs.com/package/@babel/plugin-transform-typescript) 使用 `Babel` 编译 `TypeScript`, 尽管有一些[注意事项](https://babeljs.io/docs/en/next/babel-plugin-transform-typescript.html#caveats)。

::: tip-zh | 
您可以在 [@types/webpack](https://www.npmjs.com/package/@types/webpack) 和 [@types/webpack-env](https://www.npmjs.com/package/@types/webpack-env) 内找到 `webpack` 的类型定义。`Webpack 5` 开箱即用地包含 `TypeScript` 支持。
:::
::: tip-zh | 
要拆分 `TypeScript` 配置, 请使用 `extends` 属性(`"extends": "./tsconfig.common"`), 然后使用 **`ts-loader`** 通过 `configFile` 控制 `webpack` 使用哪个文件。
:::
::: tip-zh | 
**`ESLint`** 有一个 [typescript-eslint-parser](https://www.npmjs.com/package/typescript-eslint-parser)。也可以通过 [tslint](https://www.npmjs.com/package/tslint) 对其进行处理。
:::

### 使用 TypeScript 编写 Webpack 配置
如果已经为项目设置了 `TypeScript`, 则可以通过将配置文件命名为 **`webpack.config.ts`** 来在 `TypeScript` 中编写配置。`Webpack` 能够自动检测到并正确运行。

为此, 您需要在项目中安装 [ts-node](https://www.npmjs.com/package/ts-node) 或 [ts-node-dev](https://www.npmjs.com/package/ts-node-dev), 因为 `webpack` 使用它来执行配置。

如果您以 `watch` 模式或通过 `webpack-dev-server` 运行 `webpack`, 默认情况下, 编译错误会导致构建失败。为避免这种情况, 请使用以下配置:

**tsconfig.json**
```json
{
  "ts-node": {
    "logError": true,
    "transpileOnly": true
  }
}
```
尤其是该 `logError` 配置非常重要, 因为如果没有此配置, 则会使 `ts-node` 在构建错误时崩溃。如果您想在进程之外进行类型检查, 设置 `transpileOnly` 选项很有用。例如, 您可以使用单独的脚本运行 `tsc`。通常, 编辑器工具可以在开发过程中捕获类型问题, 因此无需通过 **`ts-node`** 检查。

### Flow
[Flow](https://flow.org/) 根据您的代码及其类型注释执行静态分析。您必须将其作为单独的工具安装, 然后针对您的代码运行它。

如果使用 `React`, 则 `React` 特定的 `Babel` 预设通过 [babel-plugin-syntax-flow](https://www.npmjs.com/package/babel-plugin-syntax-flow) 来完成大部分工作。它可以剥离 `Flow` 注释, 并将您的代码转换为可以进一步传输的格式。

[flow-runtime](https://www.npmjs.com/package/flow-runtime) 允许基于我们的 `Flow` 注释进行运行时检查。这些方法补充了 `Flow` 静态检查器, 使您可以捕获更多问题。

::: tip-zh | 
[flow-coverage-report](https://www.npmjs.com/package/flow-coverage-report) 报告显示 `Flow` 类型注释的代码覆盖率。
:::

### WebAssembly
[WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) 允许开发人员使用非 `JavaScript` 编程语言编写代码并将其编译为在浏览器中运行的代码。它是对 `JavaScript` 的补充, 并提供了一种潜在的优化途径。当您想运行旧的应用程序而不将其完全移植到 `JavaScript` 时, 该技术也很有用。

从 `webpack 5` 开始, 该工具支持新型异步 `WebAssembly`。官方示例 [wasm-simple](https://github.com/webpack/webpack/tree/master/examples/wasm-simple) 和 [wasm-complex](https://github.com/webpack/webpack/tree/master/examples/wasm-complex) 很好地说明了实验功能。

### 结论
`Babel` 已成为开发人员必不可少的工具, 成为标准与老版本浏览器的桥梁。即使您针对的是现代浏览器, 也可以选择通过 `Babel` 进行转换。

回顾一下:
- **`Babel`** 使您可以控制要支持的浏览器。它可以将 `ES2015+` 功能编译为老版本浏览器可以理解的形式。**`@babel/preset-env`** 很有价值, 因为它可以根据您的浏览器定义选择要编译的功能以及要启用的 `polyfill`。
- `Babel` 允许您使用实验性的语言功能。您可以找到许多插件, 这些插件可以通过优化来改善开发体验和生产构建。
- 可以针对每个开发目标启用 `Babel` 功能。这样, 您可以确定在正确的位置使用了正确的插件。
- 除了 `Babel`, `webpack` 还支持其他解决方案, 例如 `TypeScript` 或 `Flow`。`Flow` 可以补充 `Babel`, 而 `TypeScript` 是一种可以编译为 `JavaScript` 的编译语言。
