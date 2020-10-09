## Targets
尽管 `webpack` 最常用于打包 `web` 应用程序, 但它还可以用于其他用途。您可以将其用于 `Node` 或桌面环境, 如 `Electron`。`Webpack` 还可以通过编写适当的输出包装器, 将源码打包为一个库, 从而可以直接使用该库。

`Webpack` 的输出目标由 `target` 字段控制。接下来, 您将了解主要目标, 然后深入研究特定于库的选项。

### Web
`Webpack` 默认使用 `web` 作为目标。对于象您在本书中开发的那些 `web` 应用程序, 该目标非常理想。`Webpack` 引导应用程序并加载其模块。清单中将维护要加载的模块的初始列表, 然后模块可以按照定义相互加载。

### Web Worker
该 `webworker` 目标将应用打包为一个 [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)。如果要在应用程序主线程之外执行计算而不会阻塞用户界面, 则使用 `Web Worker` 很有用。您应该注意一些限制:
- 使用 `webworker` 目标时, 不能使用 `webpack` 的哈希功能。
- 您无法通过 `Web Worker` 操作 `DOM`。如果将当前项目打包为 `Web Worker`, 则该项目不会显示任何内容。

::: tip-zh | 
["Web Worker"]() 一章中详细讨论了 `Web Worker` 及其用法。
:::

### Node
`Webpack` 提供了两个特定于 `Node` 的目标: `node` 和 `async-node`。除非使用 `async-node` 作为构建目标, 否则它将使用标准的 `Node` 的 `require` 来加载模块。在 `async-node` 这种情况下, 它将包装模块, 以便通过 `Node` 的 `fs` 和 `vm` 模块异步加载它们。

使用 `node` 目标的主要用例是["服务器端渲染"]()(**`SSR`**)。

::: tip-zh | 
要了解有关该主题的更多信息, 请阅读 James Long 的有关使用 `webpack` 开发后端应用程序的[系列文章](https://jlongster.com/Backend-Apps-with-Webpack--Part-I)。
:::

::: tip-zh | 
如果您使用 `webpack` 开发服务器, 请参阅 [nodemon-webpack-plugin](https://www.npmjs.com/package/nodemon-webpack-plugin)。该插件无需设置外部观察程序即可重新启动服务器进程。
:::

### Desktop
有一些桌面应用开发工具, 如 [NW.js](https://nwjs.io/)(以前是 `node-webkit`) 和 [Electron](https://electron.atom.io/)(以前是 `Atom`)。 `Webpack` 可以针对以下目标:
- `node-webkit`: 定位为 `NW.js`, 同时将其视为实验性的。
- `atom`, `electron`, `electron-main`: 目标 [Electron main process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md)。
- `electron-renderer`: 目标 `Electron` 渲染进程。

如果希望为 `Electron` 和 `React` 的开发提供 `webpack` 热加载, 那么 [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) 是一个很好的选择。使用 [electron-quick-start](https://github.com/electron/electron-quick-start) 也是一种可选的方案。

### 构建目标
`Webpack` 通常用于通过返回配置对象, `Promise` 解析为一个对象或函数返回一个对象来编译单个目标。此外, 它允许您一次指定多个目标, 以防您返回配置数组。在生成[多页]()或使用[国际化]()时, 该技术很有用。[parallel-webpack](https://www.npmjs.com/package/parallel-webpack) 能够并行运行多个 `webpack` 实例, 以加快这种使用速度。

### 结论
`Webpack` 支持 `"web"` 之外的目标。基于此, 您可以说 `"webpack"` 是一种考虑其功能的保守说法。

回顾一下:
- `Webpack` 的输出目标可以通过 `target` 进行控制。它默认为 `web`, 但也接受其他选项。
- `Webpack` 除了其 `web` 目标之外, 还可以定位桌面, `Node` 和 `Web Worker`。
- 如果在[服务器端渲染]()设置中, 则 `node` 目标非常有用。

在下一章中, 您将学习如何处理多页设置。