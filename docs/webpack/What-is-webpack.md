## 什么是webpack

`Webpack` 是一个**模块化打包工具**。`Webpack` 可以与一个单独的任务运行器一起进行打包。但是, 由于社区开发的 `webpack` 插件, 打包程序(`bundler`)和任务运行程序(`taskrunner`)之间的界限变得模糊。有时, 这些插件用于执行通常在 `webpack` 之外完成的任务, 例如清理构建目录或部署构建, 尽管您也可以将这些任务推到 `webpack` 之外再执行。

`React` 和 **`Hot Module Replacement`**(`HMR`)有助于普及 `webpack`, 并使其在 [Ruby on Rails](https://github.com/rails/webpacker) 等其他环境中使用。尽管其名称如此, 但 `webpack` 不限于 `Web` 开发。它也可以与其他目标捆绑在一起, 如["Targets"](./Output/targets)一章中所述。

::: tip-zh | 
如果您想更详细地了解构建工具及其历史, 请查看["构建工具比较"](./Appendices/comparison.html)附录。
:::

### Webpack依赖于模块
您可以使用 `webpack` 打包的最小项目包括**输入**(`input`)和**输出**(`output`)。打包过程从用户定义的入口(`entries`)开始。入口本身就是**模块**, 可以通过 **`import`** 导入其他模块。

当您使用 `webpack` 打包项目时, 它会遍历 `import`, 构造项目的**依赖图**, 然后根据配置生成**输出**。此外, 可以定义**拆分点**以在项目代码本身内创建单独的包。

`Webpack` 在内部使用所谓的**块**(`chunks`)来管理打包过程, 该术语通常出现在与 `webpack` 相关的文档中。块是包含在 `webpack` 输出中的包中的较小代码段。

`Webpack` 开箱即用地支持 `ES2015`, `CommonJS`, `MJS` 和 `AMD` 模块格式。还支持 [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly), 这是在浏览器中运行低级代码的新方法。 `loader` 机制也适用于 `CSS`, 并通过 **`css-loader`** 提供 <mark>@import</mark> 和 <mark>url()</mark> 支持。您可以找到用于特定任务的插件, 例如 `minification`(压缩), `internationalization`(国际化), `HMR` 等。

::: tip-zh | 
依赖图是一种有向图, 它描述节点之间的关系。在这种情况下, 图形的定义是通过文件之间的引用(<mark>require</mark>, <mark>import</mark>)。 `Webpack` 静态遍历这些内容, 而无需执行源代码来生成创建 `bundle` 所需的依赖图。
:::

### Webpack的执行过程
![webpack的执行过程](../webpack.webp)

`Webpack` 从**入口**开始。通常, 这些是 `JavaScript` 模块, `webpack` 在其中开始遍历过程。在此过程中, `webpack` 会根据**加载器**配置评估匹配项, 该配置程序会告诉 `webpack` 如何转换每个匹配项。

::: tip-zh | 
从 `webpack 5` 开始, 支持 [experiments](https://webpack.js.org/configuration/experiments/#experiments)。这代表隐藏在特性标志后面的未来功能, 并允许早期测试。
:::

### 解析过程
**入口**文件本身就是一个模块, 当 `webpack` 遇到一个模块时, 它会尝试使用 <mark>resolve</mark> 配置将模块与文件系统进行匹配。例如, 您可以告诉 `webpack` 除了 <mark>node_modules</mark> 模块外, 还可以对特定目录执行查找。

::: tip | 
可以调整 `webpack` 对文件扩展名匹配的方式, 并且可以为目录定义特定的别名。在[使用软件包](./Techniques/consuming)章节涵盖了更详细的这些想法。
:::

如果解析失败, 则 `webpack` 将引发运行时错误。如果 `webpack` 成功解析文件, 则 `webpack` 将根据加载器定义对匹配的文件执行处理。每个加载器针对模块内容应用特定的转换。

加载器与已解析文件匹配的方式可以通过多种方式进行配置, 包括按文件类型和文件系统中的位置进行配置。`Webpack` 的灵活性甚至允许您根据文件导入项目的位置对文件进行特定的转换。

对 `webpack` 的加载器执行相同的解析过程。`Webpack` 允许您在确定应该使用哪个加载器时应用类似的逻辑。因此, 加载器拥有自己的解析配置。如果 `webpack` 无法执行加载器查找, 则会引发运行时错误。

::: tip | 
要解决此问题, `webpack` 依赖于下面的[增强解析](https://www.npmjs.com/package/enhanced-resolve)包。
:::

### Webpack针对任何文件类型进行解析
`Webpack` 将解析它在构建依赖关系图时遇到的每个模块。如果入口包含依赖项, 则将针对每个依赖项递归执行该过程, 直到遍历完成。`Webpack` 可以针对任何文件类型执行此过程, 这与 `Babel` 或 `Sass` 编译器之类的专用工具不同。

`Webpack` 让您可以控制如何处理它遇到的不同资源。例如, 您可以决定将资源内联到 `JavaScript` 捆绑包中以避免请求。`Webpack` 还允许您使用 `CSS` 模块等技术将样式与组件相结合。`Webpack` 生态系统充满了扩展其功能的插件。

尽管 `webpack` 主要用于打包 `JavaScript`, 但它可以捕获图像或字体等资源, 并为它们产出单独的文件。入口只是打包过程的一个起点, `webpack` 产出的内容完全取决于配置它的方式。

### 评估流程
假设找到了所有加载器, 则 `webpack` 将从下至上, 从右至左(<mark>styleLoader(cssLoader('./main.css'))</mark>)评估匹配的加载器, 同时依次通过每个加载器运行模块。结果, 您将获得 `webpack` 注入到结果包中的输出。["加载器定义"](./Loading/loader-definitions)一章详细介绍了该主题。

如果加载器评估完成而没有运行时错误, 则 `webpack` 会将在捆绑包中包含源代码。尽管加载器可以做很多事情, 但它们不能为高级任务提供足够的动力。插件可以拦截 `webpack` 提供的**运行时事件**。

一个很好的例子是由 `MiniCssExtractPlugin` 执行的提取过程, 当与加载器一起使用时, 将 `CSS` 文件从捆绑软件中提取出来并分离到一个单独的文件中。没有此步骤, `CSS` 将被内联到生成的 `JavaScript` 中, 因为 `webpack` 默认将所有代码视为 `JavaScript`。提取思路在["分离CSS"](./Styling/separating-css)一章中进行了讨论。

### 完成
在评估完每个模块之后, `webpack` 会写入 **`output`**。输出包括一个引导脚本。这是一个小型运行时, 在浏览器中执行结果, 并在 `manifest` 清单中列出要加载的包。

`Manifest` 清单可以提取到其自己的文件中, 如本书稍后所述。根据您使用的构建目标, 输出会有所不同(针对 `web` 不是唯一的选择)。

打包过程还不止这些。例如, 您可以定义特定的拆分点, 其中 `webpack` 会根据应用程序逻辑生成单独的包, 并进行加载。在[代码拆分](./Building/code-splitting)一章中讨论了这个想法。

### Webpack由配置驱动
`Webpack` 的核心在于配置。这是从[官方webpack教程](https://webpack.js.org/get-started/)改编而来的示例, 并扩展了其要点:

**webpack.config.js**
```js
const webpack = require("webpack");

module.exports = {
  entry: { // Where to start bundling
    app: "./entry.js",
  },
  output: { // Where to output
    // Output to the same directory
    path: __dirname,

    // Capture name from the entry using a pattern
    // In the example, it will result as app.js.
    filename: "[name].js",
  },
  module: { // How to resolve encountered imports
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [ // What extra processing to perform
    new webpack.DefinePlugin({ ... }),
  ],
  resolve: { // Adjust module resolution algorithm
    alias: { ... },
  },
};
```

`Webpack` 的配置模型有时会感到有些不透明, 因为配置文件看起来是相互独立的, 而且很难理解 `webpack` 在做什么, 除非您了解其背后的想法。这就是为什么这本书存在的原因, 因为一旦你知道了概念和配置的每个部分在做什么, `webpack` 就更有意义了, 你可以从中学到更多。

::: tip-zh | 
`Webpack` 的属性定义通常是灵活的, 最好查看文档或 `TypeScript` 定义以了解允许的内容。例如, <mark>entry</mark> 甚至可以是一个函数或一个异步函数。有时有多种方法可以达到相同目的, 这尤其适用于加载器。
:::

::: warning-zh | 
`Webpack` 的插件是从上到下注册的, 但是加载器遵循相反的规则。如果加载器与现有的定义相匹配, 则意味着您将首先对其求值, 然后添加一个与现有 <mark>test</mark> 匹配的加载器。请参阅[加载器定义](./Loading/loader-definitions)一章, 以更好地理解其中差异。
:::

### 资源哈希
使用 `webpack`, 您可以向每个捆绑包名称注入一个哈希(`hash`)值(例如 `app.d587bbd6.js`), 以便在更改时使客户端的捆绑包失效。在理想情况下, **捆绑拆分**允许客户机只重新加载一小部分数据。

### 模块热更新(HMR)
您可能已经熟悉 [LiveReload](http://livereload.com/) 或 [BrowserSync](http://www.browsersync.io/) 之类的工具。这些工具会在您进行更改时自动刷新浏览器。[模块热更新](./Appendices/hmr)(`HMR`)使事情更进一步。对于 `React`, 它允许应用程序保持其状态而无需强制刷新。尽管这听起来并不很特别, 但在实践中却可以带来很大的不同。

`HMR` 也可以通过 [livereactload](https://github.com/milankinen/livereactload) 在 `Browserify` 中使用, 因此它不是 `webpack` 独有的功能。

### 代码拆分
除了 `HMR`, `webpack` 的打包功能还有很多。`Webpack` 允许您以各种方式拆分代码。您甚至可以在应用程序执行时动态加载代码。这种延迟加载非常方便, 特别是对于庞大的应用程序, 因为可以根据需要动态加载依赖项。

甚至小型应用程序也可以从**代码拆分**中受益, 因为它允许用户更快地获得可用的东西。毕竟, 谁也不会嫌应用程序运行的更快。了解基本技术是值得的。

### Webpack 5
`Webpack 5` 是该工具的新版本, 它承诺进行以下更改:

- 在开发过程中有更好的缓存行为 —— 现在, 它可以在不同的运行之间重用基于磁盘的缓存。
- 通过["Module Federation"](./Output/module-federation)支持微前端样式开发, 您可以在本章中进一步了解它。
- 内部 `API` (特别是插件)已得到改进, 旧 `API` 已被弃用。
- 开发和生产目标具有更好的默认值。例如, 现在 <mark>contenthash</mark> 将其用于生产, 从而产生可预测的缓存行为。在将哈希值添加到文件名一章中详细讨论了该主题。

[Webpack 5 changelog](https://github.com/webpack/changelog-v5) 列出了所有主要更改。除了改进缓存和模块联合之外, 还可以将其视为清理版本。

有一个[正式的迁移指南](https://webpack.js.org/migrate/5/), 列出了将项目从 `webpack 4` 移植到 `5` 所需的所有更改。

项目可能会在不对配置进行任何更改的情况下运行, 但是您会收到弃用警告。要找出它们的来源, 请在运行 `webpack` 时使用 <mark>node --trace-deprecation node_modules/webpack/bin/webpack.js</mark>。

在撰写本文时, `webpack 5` 处于 **`beta`** 版, 而本书示例也可以使用它, 尽管您可能偶尔会看到弃用警告。

### 结论
`Webpack` 具有明显的学习曲线。然而, 考虑到从长远来看它可以节省更多的时间和精力, 这是一个值得学习的工具。为了更好地了解它与其他工具的比较, 请查看["构建工具比较"](./Appendices/comparison.html)附录。

`Webpack` 不能解决所有问题。然而, 它确实解决了打包的问题。这就使得在开发过程中就少了一个顾虑。

总结一下:
- `Webpack` 是一个**模块化打包工具**, 但是您也可以使用它运行任务。
- `Webpack` 依赖于下面的**依赖图**。`Webpack` 遍历源代码来构建依赖图, 并使用此信息和配置生成捆绑包。
- `Webpack` 依赖于**加载器**和**插件**。加载器在模块级别上运行, 插件依赖于 `webpack` 提供的钩子, 并且具有对其执行过程的最佳访问权限。
- `Webpack` 的**配置**描述了它该如何转换图片资源以及它该生成怎样的输出。如果使用如**代码拆分**之类的功能, 则部分信息可以包含在源代码中。
- **模块热更新**(`HMR`)有助于普及 `webpack`。这个特性可以通过在浏览器中更新代码来增强开发体验, 而不需要刷新整个页面。
- `Webpack` 可以为文件名生成**哈希值**, 允许您在内容更改时使过去的包无效。

在本书的下一部分中, 您将学习如何使用 `webpack` 构造开发配置, 同时了解其基本概念。

::: tip-zh | 
如果您仍然不确定为什么需要 `webpack` 或为什么需要进行资源打包, 请阅读[为什么我要使用webpack?](http://tinselcity.net/whys/packers)
:::

> 译者注: 只要理解本质, 怎么叫 `loader` 其实都可以, 看自己喜好, 例如: 加载程序, 装载程序, 加载机, 装载机。本书全部翻译为 `加载器`。
