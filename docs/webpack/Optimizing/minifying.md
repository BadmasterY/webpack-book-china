## 压缩
从 `webpack 4` 开始, 默认情况下使用 [terser](https://www.npmjs.com/package/terser) 将生产输出进行压缩。`Terser` 是与 `ES2015+` 兼容的 `JavaScript` 压缩程序。与许多项目的早期标准 `UglifyJS` 相比, 它是面向未来的选择。

尽管 `webpack` 默认情况下会压缩输出, 但是最好了解如何自定义行为(如果要进一步调整或替换压缩工具)。

### 压缩 JavaScript
压缩的重点是将代码转换成更简短的形式。安全转换通过重写代码来做到这一点, 而不会破坏代码。很好的例子包括重命名变量, 甚至基于无法访问的事实删除整个代码块(`if(false)`)。

不安全的转换会破坏代码, 因为它们可能会丢失底层代码所依赖的隐式内容。例如, `Angular 1` 在使用模块时需要特定的函数参数命名。重写参数会破坏代码, 除非在这种情况下采取预防措施。

### 修改 JavaScript 压缩过程
在 `webpack` 中, 压缩过程是通过两个配置字段控制的: `optimization.minimize` 标记用于切换和 `optimization.minimizer` 数组用于配置进程。

为了调整默认值, 我们将 [terser-webpack-plugin](https://www.npmjs.com/package/terser-webpack-plugin) 附加到项目, 以便可以对其进行调整。

首先, 将插件安装到项目中:
```bash
npm add terser-webpack-plugin --develop
```
要将其附加到配置, 需要在 `webpack.parts.js` 中添加一段函数:

**webpack.parts.js**
```js
const TerserPlugin = require("terser-webpack-plugin");

exports.minifyJavaScript = () => ({
  optimization: {
    minimizer: [new TerserPlugin({ sourceMap: true })],
  },
});
```

将其连接到配置文件:

**webpack.config.js**
```js{2}
const productionConfig = merge([
  parts.minifyJavaScript(),
  ......
]);
```

如果立即执行 `npm run build`, 您应该会看到与以前几乎相同的结果。

::: tip-zh | 
默认情况下 `source map`。您可以通过 `sourceMap` 标志启用它们。您应该查看 **`terser-webpack-plugin`** 文档以了解更多选项。
:::
::: tip-zh | 
要调整 **`Terser`** 行为, 请将 `terserOptions` 与相关选项附加到插件上。
:::

### 使用 Closure Compiler 压缩 JavaScript
[closure-webpack-plugin](https://www.npmjs.com/package/closure-webpack-plugin) 在底层使用 `Google` 的 `Closure Compiler`, 并行运行, 通常会得到很好的结果。

### 加速 JavaScript 执行
特定的解决方案允许您对代码进行预处理, 以便它运行得更快。这些方案补充了压缩技术, 可以分为作用域提升、预评估和改进解析。有时, 这些技术可能会增加整个包的大小, 但是允许代码更快的执行。

#### 作用域提升
从 `webpack 4` 开始, 默认情况下在生产模式下应用作用域提升。它将所有模块提升到一个作用域, 而不是为每个模块编写单独的闭包。这样做会减慢构建速度, 但会为您提供以更快速度执行的捆绑包。在 `webpack` 博客上[了解有关范围提升的更多信息](https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f)。

::: tip-zh | 
将 `--display-optimization-bailout` 标志传递到 `webpack` 以获得与作用域提升结果相关的调试信息。
:::

#### 预评估
[prepack-webpack-plugin](https://www.npmjs.com/package/prepack-webpack-plugin) 使用 [Prepack](https://prepack.io/)(一个部分 `JavaScript` 评估程序)。它重写可以在编译时完成的计算, 因此可以加快代码执行速度。另请参见 [val-loader](https://www.npmjs.com/package/val-loader) 和 [babel-plugin-preval](https://www.npmjs.com/package/babel-plugin-preval)。

### 压缩 HTML
如果您使用 [html-loader](https://www.npmjs.com/package/html-loader) 通过代码使用 `HTML` 模板, 则可以使用 [posthtml-loader](https://www.npmjs.com/package/posthtml-loader) 通过 [posthtml](https://www.npmjs.com/package/posthtml) 对其进行预处理。您可以使用 [posthtml-minifier](https://www.npmjs.com/package/posthtml-minifier) 通过它来压缩 `HTML`, 并可以使用 [posthtml-minify-classnames](https://www.npmjs.com/package/posthtml-minifier) 来缩短类名的长度。

### 压缩 CSS
[clean-css-loader](https://www.npmjs.com/package/clean-css-loader) 允许您使用流行的 `CSS` 压缩工具 [clean-css](https://www.npmjs.com/package/clean-css)。

[optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin) 是一个基于插件的选项, 它在 `CSS` 资源上应用所选的压缩工具。使用 `minicsSextTrackPlugin` 可能导致 `CSS` 重复, 因为它只合并代码块。`OptimizeCSSAssetsPlugin` 通过对生成的结果进行操作来避免这个问题, 从而可以获得更好的结果。

#### 配置 CSS 压缩
在可用的解决方案中, `OptimizeCSSAssetsPlugin` 是最灵活的一种, 使用它可以将其他软件包与 `webpack` 连接。要将其附加到配置文件中, 请先安装插件和 [cssnano](http://cssnano.co/):
```bash
npm add optimize-css-assets-webpack-plugin cssnano --develop
```

像 `JavaScript` 一样, 您可以将其包装在 `webpack.parts.js` 的一个函数中:

**webpack.parts.js**
```js
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const cssnano = require("cssnano");

exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
});
```

::: warning-zh | 
如果像["构建分析"](../Optimizing/build-analysis)一章中所讨论的那样将 `--json` 输出与 `webpack` 一起使用, 那么应该为插件设置 `canPrint: false`。
:::

将函数连接到配置文件:

**webpack.config.js**
```js{4-8}
const productionConfig = merge([
  ......
  parts.minifyJavaScript(),
  parts.minifyCSS({
    options: {
      preset: ["default"],
    },
  }),
  ......
]);
```

如果您现在构建项目(`npm run build`), 您应该注意到 `CSS` 已经变小了, 因为移除了注释, 并且已经进行了压缩:
```bash{10}
⬡ webpack: Build Finished
⬡ webpack: Hash: c205c9aaa067750f6e79
  Version: webpack 5.0.0-beta.29
  Time: 11809 ms
  Built at: 2020-09-22 14:46:59
  asset 34.js 196 bytes [emitted] [minimized] 1 related asset
  asset 728.js 139 KiB [emitted] [minimized] (id hint: vendors) 2 related assets
  asset index.html 267 bytes [emitted]
  asset logo.jpg 515 KiB [emitted] [big] (auxiliary name: main)
  asset main.css 1.14 KiB [emitted] (name: main)
  asset main.js 2.89 KiB [emitted] [minimized] (name: main) 1 related asset
  Entrypoint main = 728.js main.css main.js (728.js.map logo.jpg main.js.map)
  ......
```
::: tip-zh | 
[compression-webpack-plugin](https://www.npmjs.com/package/compression-webpack-plugin) 允许您将生成压缩文件的问题推送到 `webpack`, 以潜在地节省服务器上的处理时间。
:::
::: tip-zh | 
使用 [last-call-webpack-plugin](https://www.npmjs.com/package/last-call-webpack-plugin) 是一种更通用的方法, 您可以使用它来定义在 `webpack` 完成处理之前针对哪种文件格式使用哪种处理。
:::

### 压缩捆绑包
压缩技术, 如 `gzip` 或 `brotli`, 可以用来进一步减小文件大小。使用额外压缩的缺点是, 它将导致客户端进行额外的计算, 但从好的方面来说, 您可以节省带宽。通常, 压缩设置可以在服务器端完成, 当然, 也可以使用以下插件使用 `webpack` 执行预处理:
- [compression-webpack-plugin](https://www.npmjs.com/package/compression-webpack-plugin) 是一个通用压缩插件, 可让您在多个选项中进行选择
- [brotli-webpack-plugin](https://www.npmjs.com/package/brotli-webpack-plugin) 专门用于 `brotli`。

### 混淆输出
为了使第三方更难以阅读您的代码, 可以应用 [obfuscator-loader](https://github.com/javascript-obfuscator/obfuscator-loader)。尽管在与客户端共享时很难保护代码, 但是可以使代码更难阅读。

### 结论
压缩是使捆绑包体积变小的最佳方式。回顾一下:
- 如果使用安全转换, 压缩过程将分析您的源代码并将其转换为具有相同含义的简短形式。特定的不安全转换使您可以获得体积更小的结果, 同时可能破坏底层依赖于特定参数命名的代码。
- `Webpack` 默认在生产模式下使用 `Terser` 执行压缩。其他解决方案(例如 `Google` 的 `Closure Compiler`)提供了类似的功能, 但需要自己进行配置。
- 除了 `JavaScript`, 还可以压缩其他资源, 例如 `CSS` 和 `HTML`。压缩这些要求使用特定的技术, 这些技术必须通过自己的加载器和插件来应用。

在下一章中, 您将学习对代码应用 `tree shaking`。