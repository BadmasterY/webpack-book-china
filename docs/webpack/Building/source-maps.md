## Source map
![Chrome 中的 Source Map](../../build/build_chrom_source_map.webp)

当您的源代码经过转换后, 在浏览器中进行调试将成为问题。**`Source map`** 通过在原始源代码和转换后的源代码之间提供**映射**来解决此问题。除了将源代码编译为 `JavaScript` 之外, 这还适用于样式设置。

一种方法是在开发过程中跳过 `Source map`, 并依靠浏览器对语言功能的支持。如果您使用不带任何扩展的 `ES2015` 并使用现代浏览器进行开发, 则可以正常工作。这样做的好处是可以避免与 `source map` 有关的所有问题, 同时可以获得更好的性能。

如果您使用的是 `webpack 4` 或更高版本以及该 `mode` 选项, 该工具将以 `development` 模式自动为您生成 `source map`。但是, 生产使用需要注意。

::: tip-zh | 
如果您想更详细地了解 `source map` 的思想, 请阅读 [Ryan Seddon 对该主题的介绍](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)。
:::
::: tip-zh | 
要了解 `webpack` 如何处理 `source map`, 请参见该工具作者的 [source-map-visualization](https://sokra.github.io/source-map-visualization/)。
:::

### 内联 source map 和单独 source map
`Webpack` 可以生成内联或单独的 `source map` 文件。内联代码包含在产出的捆绑包中, 由于性能更好, 因此在开发过程中很有价值。单独的文件便于生产使用, 因为加载 `source map` 是可选的。

可能不希望为您的产品捆绑包生成 `source map`, 因为这使得别人可以毫不费力地检查您的应用程序。通过禁用 `source map`, 您正在执行某种混淆处理。

无论您是否要为生产模式启用 `source map`, 它们都便用于转移。跳过源地图可加快构建速度, 因为以最佳质量生成 `source map` 可能是一项复杂的操作。

**隐藏的 `source map`** 仅提供堆栈跟踪信息。您可以将它们与监视服务连接起来, 以便在应用程序崩溃时获取跟踪, 从而可以解决有问题的情况。虽然这不是理想的方法, 但知道可能的问题总比不知道要好。

### 启用 source map
`Webpack` 提供了两种启用 `source map` 的方法。有一个 `devtool` 快捷方式字段。您还可以找到两个提供更多可调整选项的插件。本章末尾将简要讨论这些插件。除了 `webpack`, 还必须在用于开发的浏览器上启用对 `source map` 的支持。

#### 在 webpack 中启用 source map
首先, 您可以将核心思想包装在 `webpack.parts.js` 中。如果需要, 可以将其转换为以后使用插件:

**webpack.parts.js**
```js
exports.generateSourceMaps = ({ type }) => ({
    devtool: type,
});
```
`Webpack` 支持多种 `source-map` 类型。这些类型的不同取决于质量和构建速度。现在, 您可以为生产启用 `source-map`, 并让 `webpack` 使用默认值进行开发。配置如下:

**webpack.config.js**
```js{2}
const productionConfig = merge([
  parts.generateSourceMaps({ type: "source-map" }),
  ......
]);
```
`source-map` 是所有产品中最慢和最高质量的选择, 但这对于生产版本来说很好。

如果您现在构建项目(`npm run build`), 则应该在输出中看到源映射:
```bash
Hash: 53d2c4e897619ee2a33f
Version: webpack 4.43.0
Time: 2775ms
Built at: 07/10/2020 2:02:04 PM
       Asset       Size  Chunks                   Chunk Names
  index.html  237 bytes          [emitted]
    main.css   8.53 KiB       0  [emitted]        main
main.css.map   85 bytes       0  [emitted] [dev]  main
     main.js   1.21 KiB       0  [emitted]        main
 main.js.map   5.13 KiB       0  [emitted] [dev]  main
Entrypoint main = main.css main.js main.css.map main.js.map
......
```
> 译者注: 截止至 `webpack@5.0.0_beta.31`, 由于 `webpack` 无法输出 `.map` 文件创建信息, 使用书上的例子代替。

好好看看那些 `.map` 文件。这就是生成文件和源文件之间的映射。在开发期间, 它将映射信息写入包中。

#### 在浏览器中启用 source map
要在浏览器中使用 `source map`, 必须按照特定于浏览器的说明显式启用源映射:
- [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging)
- [FireFox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
- [IE Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide/debugger#source-maps)
- [Safari](https://support.apple.com/guide/safari/use-the-safari-develop-menu-sfri20948/mac)

::: warning-zh | 
如果您想使用断点(如, `debugger`或多个通过浏览器设置的断点), 基于 `eval` 的选项将无法在 `Chrome` 中使用!
:::
### webpack 支持的 source map 类型
