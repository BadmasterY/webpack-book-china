## 性能
`Webpack` 开箱即用的性能通常足以满足小型项目的需要。也就是说, 随着项目规模的扩大, 性能开始达到极限, 这是 `webpack` 的问题跟踪器中经常出现的话题。

关于优化, 有几个基本规则:

1. 知道要优化什么。
2. 先执行快速调整。
3. 之后执行更多相关调整。
4. 随时评估影响。

有时优化需要付出一定的代价。例如, 您可以为了性能而牺牲内存, 或者最终使配置变得更加复杂。
::: tip-zh | 
如果您使用 `webpack` 达到内存限制, 则可以通过 `node --max-old-space-size=4096 node_modules/.bin/wp --mode development` 这类调用为其分配更多的内存。大小以兆字节为单位, 在示例中, 您将为该进程提供 `4GB` 的内存。
:::

### 衡量影响
如前一章所讨论的, 生成统计信息可用于度量构建时间。[speed-measure-webpack-plugin](https://www.npmjs.com/package/speed-measure-webpack-plugin) 提供了更详细的信息, 因此您可以知道哪些信息在您的过程中花费了大部分时间, 由此来指导您从何处开展提高性能的工作。

[webpack.debug.ProfilingPlugin](https://webpack.js.org/plugins/profiling-plugin/) 和 [cpuprofile-webpack-plugin](https://github.com/jantimon/cpuprofile-webpack-plugin) 是类似的选项, 它们能够将插件执行的时间作为可传递给 `Chrome Inspector` 的文件发出。后者也会生成火焰图。

### 高级优化
默认情况下, `webpack` 只使用单核处理, 这意味着如果不通过额外的配置或使用其他插件就无法从多核处理器中受益。这就是 [thread-loader](https://www.npmjs.com/package/thread-loader) 和第三方的解决方案(比如 [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) 和 [HappyPack](https://www.npmjs.com/package/happypack))出现的原因。

#### parallel-webpack — 并行运行多个 webpack 实例
**`parallel-webpack`** 允许您通过两种方式并行 `webpack` 配置。假设已将 `webpack` 配置定义为数组, 则可以直接并行运行它们。除此之外, **`parallel-webpack`** 可以基于给定的 **`variants`** 生成构建。

`variants` 使您可以同时生成生产和开发版本。它们使您可以创建具有不同 `target`的捆绑包, 以使其易于根据环境使用。当与 `DefinePlugin` 结合使用时, `variants` 可以用于实现特征标记, 如["环境变量"](./environment-variables)一章中所述。

可以使用 [worker-farm](https://www.npmjs.com/package/worker-farm) 来实现基本思想。实际上, **`parallel-webpack`** 底层依赖于 `worker-farm`。

可以通过将 `parallel-webpack` 作为开发依赖项安装到项目中, 然后用 `parallel-webpack` 替换 `webpack` 命令来使用。

#### thread-loader 和 happypack - 模块级并行
`thread-loader` 和 `parallel-webpack` 允许在模块级别上并行执行。`thread-loader` 在加载链中使用。但是, [使用它并不总是可以保证速度的提高]()。`happypack` 是处于维护模式中的一种更复杂的方法, 有必要检查 `thread-loader` 的并行化是否不起作用。

### 低级优化
特定的较低级别的优化可能很好理解。关键是让 `webpack` 减少工作量。请考虑以下示例:

- 考虑在开发过程中使用更快的 `source map` 类型, 或者跳过。如果您不以任何方式处理代码, 则可以跳过。
- 在开发过程中使用 [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env) 代替 `source map`, 可以为现代浏览器传输更少的特性, 并使代码更具可读性和更易于调试。
- 在开发过程中跳过 `polyfill`。将软件包(例如 [core-js](https://www.npmjs.com/package/core-js))附加到应用程序的开发版本会增加处理开销。
- 禁用开发过程中不需要的应用程序部分。编译仅一小部分正在进行的工作可能是一个不错的主意, 因为这样一来您打包的内容就少了。
- `Polyfill` 较少的 `Node` 并且不提供任何内容。 例如, 一个软件包正在使用 `Node` `process`, 如果进行 `polyfill` 反而会使包的开销增大。有关默认值, 请[参见 webpack 文档](https://webpack.js.org/configuration/node/)。
- 将很少更改的包推送到**动态加载库**(DLL)避免不必要的处理。在[官方的 webpack 示例中](https://github.com/webpack/webpack/tree/master/examples/dll-user)有相关内容, 同时 [Rob Knight 的博客](https://robertknight.me.uk/posts/webpack-dll-plugins/)中进一步解释了这个想法。[autodll-webpack-plugin](https://www.npmjs.com/package/autodll-webpack-plugin) 可以自动执行该过程, 而这在 `webpack 5` 中是多余的。

::: tip-zh | 
从 `webpack 5` 开始, 可以通过设置 `cache.type = "filesystem"` 来启用文件系统级缓存。要使它在配置更改时失效, 您应该设置 `cache.buildDependencies.config = [__filename]`。`Webpack` 会自动处理构建所监视的所有内容, 包括插件, 加载器和项目文件。
:::

#### 加载器的特定优化
加载器也有其优化之处:
- 通过在开发过程中跳过加载程序来执行较少的处理。特别是如果您使用的是现代浏览器, 则可以完全跳过使用 `babel-loader` 或同等功能的浏览器。
- 使用 `include` 或者 `exclude` 与 `JavaScript` 特定的加载器一起使用。除非它已被正确配置, 否则 `webpack` 默认遍历 `node_modules`, 并在文件上执行 `babel-loader`。
- 使用 [cache-loader](https://www.npmjs.com/package/cache-loader) 将开销相对庞大的加载器的结果(例如图像处理)缓存到磁盘。
- 使用 [thread-loader](https://www.npmjs.com/package/thread-loader) 并行执行开销庞大的加载器。鉴于 `worker` 在 `Node` 中会产生开销, 因此只有在并行化操作繁重时才值得使用 `thread-loader`。

### 在开发过程中优化重新打包效率
通过将开发配置指向库的精简版本(如 `React`), 可以改进开发过程中的重新处理时间。在 `React` 的例子中, 您将失去基于 `propType` 的验证, 但是如果重新打包的速度至关重要, 那么这种技术是值得的。

`module.noParse` 接受 `RegExp` 或 `RegExps` 数组。除了告诉 `webpack` 不要解析要使用的精简文件之外, 您还必须使用 `resolve.alias` 指向 `React`。在["使用软件包"]()一章中详细讨论了该想法。

您可以将该想法封装在一个函数中:
```js
exports.dontParse = ({ name, path }) => ({
  module: {
    noParse: [new RegExp(path)],
  },
  resolve: {
    alias: {
      [name]: path,
    },
  },
});
```

要使用该功能, 您可以按以下方式调用它:
```js
dontParse({
  name: "react",
  path: path.resolve(
    __dirname, "node_modules/react/cjs/react.production.min.js",
  ),
}),
```
在进行此更改之后, 应用程序的重建速度应该更快, 具体取决于底层实现。该技术也可以应用于生产模式。

假设 `module.noParse` 接受一个正则表达式, 如果要忽略所有 `*.min.js` 文件, 可以将其设置为 `/\.min\.js/`。

::: warning-zh | 
并非所有的模块都支持 `module.noParse`。它们不应该包含 `require`、`define` 或者类似的引用, 这将导致 `Uncaught ReferenceError: require is not defined` 错误。
:::

### Webpack 4 性能技巧
有多种 `webpack 4` 技巧可用于提高性能:
- 如果设置 `output.futureEmitAssets` 后, 则启用来自 `webpack 5` 的相关逻辑。[基于 Shawn Wang](https://twitter.com/swyx/status/1218173290579136512), 它既减少了内存使用, 又提高了性能。
- 有时会出现与版本相关的性能衰退, [Kenneth Chau 为 webPack 4 编制了一份很好的列表](https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15)。主要思想是使用带有 `experimentalWatchApi` 的 `ts-loader` 来简化 `stats.toJson`, 并设置 `output.pathinfo` 为 `false`。
- [Jared Palmer 提到](https://twitter.com/jaredpalmer/status/1265298834906910729), 将 `optimization` 属性及其 `splitChunks`, `removeAvailableModules` 和 `removeEmptyChunks` 属性设置为 `false` 可以提高开发模式下的性能。
- [webpack-plugin-ramdisk](https://www.npmjs.com/package/webpack-plugin-ramdisk) 将构建输出写入 `RAM` 磁盘, 它可以在开发期间以及在您必须执行许多后续构建的情况下提供帮助。

### 结论
您可以通过多种方式优化 `webpack` 的性能。通常, 在转向更复杂的技术之前, 最好先从更容易理解的技术开始。必须使用的确切方法取决于项目。

回顾一下:
- 首先从快速实现的高级技术开始。
- 较低级的技术更为复杂, 但也会带来更多的好处。
- 由于 `webpack` 默认使用单个实例运行, 所以并行化是值得的。
- 特别是在开发过程中, 由于使用现代浏览器, 跳过某些工作是完全可以接受的。

::: tip-zh | 
[官方构建性能指南](https://webpack.js.org/guides/build-performance/)有更多的提示。另请参阅[保证快速运行 webpack: 提高构建性能的现场指南](https://slack.engineering/keep-webpack-fast-a-field-guide-for-better-build-performance-f56a5995e8f1), [我们如何将 webpack 的构建性能提高 95％](https://blog.box.com/blog/how-we-improved-webpack-build-performance-95/), [webpack 的优化 — 一个案例研究](https://medium.com/walmartlabs/webpack-optimization-a-case-study-92b130334b6c) 和 [Google 的 Web 基本原理](https://developers.google.com/web/fundamentals/performance/webpack/)。
:::