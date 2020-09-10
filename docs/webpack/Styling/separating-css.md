## 分离 CSS
即使现在建立了一个不错的构建, 所有 `CSS` 都去了哪里? 根据配置, 它已内联到 `JavaScript` 中! 尽管这在开发过程中很方便, 但听起来并不理想。

当前的解决方案不允许缓存 `CSS`。这将导致**文档样式闪烁**(**`Flash of Unstyled Content`**, `FOUC`)。发生 **`FOUC`** 的原因是浏览器需要花费一些时间来加载 `JavaScript`, 然后才能应用样式。将 `CSS` 拆分为单独的文件可以避免这种问题, 它允许浏览器对其进行单独管理。

`Webpack` 使用 [mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin) (`MCEP`)提供了一种生成单独的 `CSS` 捆绑包的方法。它可以将多个 `CSS` 文件组合为一个。因此, 它附带了一个处理提取过程的加载器。然后, 插件获取由加载器组合的结果, 并产出带有样式的单独文件。
::: warning-zh | 
在生产环境中使用 `JavaScript` 加载内联样式可能具有潜在的危险, 因为它可以作为一个潜在的攻击媒介。**关键路径渲染**包含在初始 `HTML` 有效负载中以内联样式渲染关键 `CSS` 的想法, 从而改善网站的感知性能。在有限的上下文中, 内联少量 `CSS` 可能是可行的选择, 以减少请求数量, 从而加快初始负载。
:::
::: tip-zh | 
[extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin) 是由社区维护的替代 **`mini-css-extract-plugin`** 的插件, 该插件特别为服务器端渲染而设计。
:::

### MiniCssExtractPlugin 配置
首先安装插件:
```bash
npm add mini-css-extract-plugin --develop
```
> 译者注: 该插件依赖的 **`normalize-url`** 需要依赖 `url` 包, `webpack < 5` 默认添加该依赖, 而 `webpack 5` 以后需要手动添加 <mark>npm add url --develop</mark>。

`MiniCssExtractPlugin` 包括一个加载器, <mark>MiniCssExtractPlugin.loader</mark> 用于标记要提取的资源。然后, 一个插件根据此注释执行其工作。

添加配置如下:

**webpack.parts.js**
```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

exports.extractCSS = ({ options = {}, loaders = [] } = {}) => {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader, options },
            "css-loader",
          ].concat(loaders),
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],
  };
};
```
该 <mark>[name]</mark> 占位符使用引用 `CSS` 的入口的名称。在[将哈希添加到文件名]()一章中详细讨论了占位符和哈希。

::: tip-zh | 
如果要将结果文件输出到特定目录, 可以通过传递路径来完成。范例: <mark>filename: "styles/[name].css"</mark>。
:::

### 连接配置
使用以下配置连接功能:

**webpack.config.js**
```js{3,6,8-10,14}
const commonConfig = merge([
  ......
  // parts.loadCSS(),
]);

// const productionConfig = merge([]);

const productionConfig = merge([
  parts.extractCSS(),
]);

const developmentConfig = merge([
  ......
  parts.extractCSS({ options: { hmr: true } }),
]);
```
使用此配置, 您仍可以在开发过程中享受来自 `HMR` 的便利性。对于生产版本, 可以生成单独的 `CSS` 文件。<mark>HtmlWebpackPlugin</mark> 自动将其拾取并将其注入 `index.html`。

::: tip-zh | 
如果您使用 [CSS 模块](../Appendices/css-modules), 请记住按照["加载样式"](./loading-styles)一章中的说明对 <mark>use</mark> 进行调整。您可以为标准 `CSS` 和 `CSS` 模块维护单独的配置, 以便通过离散逻辑加载它们。
:::
::: tip-zh | 
您现在可以删除该 <mark>loadCSS</mark> 功能, 因为不再需要它。上面的配置已完全替代了它。
:::

运行之后 <mark>npm run build</mark>, 您应该看到类似于以下内容的输出: 
```bash
⬡ webpack: Build Finished
⬡ webpack: Hash: 8b077f81e014241a6010
  Version: webpack 5.0.0-beta.29
  Time: 1024 ms
  Built at: 2020-09-10 13:08:23
  asset ./css/main.css 35 bytes [compared for emit] (name: main)
  asset index.html 243 bytes [compared for emit]
  asset main.js 14.7 KiB [compared for emit] [minimized] (name: main)
  Entrypoint main = ./css/main.css main.js
  ./src/index.js + 1 modules 271 bytes [built]
  ./node_modules/webpack-plugin-serve/client.js 1.05 KiB [built]
  ./src/main.css 39 bytes [built]
  ./node_modules/webpack-plugin-serve/lib/client/client.js 3.32 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/log.js 756 bytes [built]
  css ./node_modules/css-loader/dist/cjs.js!./src/main.css 34 bytes [built]
  ./node_modules/webpack-plugin-serve/lib/client/ClientSocket.js 2.27 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/hmr.js 1.69 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/overlays/progress-minimal.js 2.38 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/overlays/progress.js 3.88 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/overlays/status.js 8.27 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/overlays/util.js 1.17 KiB [built]
      + 4 hidden modules 
```

现在, 样式已作为单独的 `CSS` 文件产出。因此, `JavaScript` 包体积变得稍小一些, 可以避免 **`FOUC`** 问题。浏览器不必等待 `JavaScript` 加载即可获取样式信息。它可以单独处理 `CSS`, 从而避免出现闪烁。

### 管理 JavaScript 之外的样式
尽管建议通过 `JavaScript` 设置样式然后绑定, 但也可以通过一个 <mark>entry</mark> 和 [glob](https://www.npmjs.com/package/glob) 设置 `CSS` 文件来获得相同的结果:
```js
......
const glob = require("glob");

const commonConfig = merge([
  {
    entry: {
      ......
      style: glob.sync("./src/**/*.css"),
    },
    ......
  },
  ......
]);
```
进行此类更改之后, 您将不必从应用程序代码中引用样式。在这种方法中, 必须小心 `CSS` 的顺序。

因此, 您应会同时获得 `style.css` 和 `style.js` 两个文件。后一个文件包含类似 <mark>webpackJsonp([1,3],[function(n,c){}]);</mark> 的内容, 同时它不会执行 [webpack issue 1967](https://github.com/webpack/webpack/issues/1967) 中讨论的任何操作。该限制将在 `webpack 5` 中消失, 因为它不会为任何空的内容生成 `JavaScript` 文件。

> 译者注: `webpack 5` 中, 确实不再产生任何空的 `JavaScript` 文件了。

如果您希望严格控制顺序, 可以设置一个 `CSS` 入口, 然后使用 <mark>@import</mark> 通过该入口将其余部分带到项目中。另一个选择是设置一个 `JavaScript` 入口并通过 <mark>import</mark> 来获得相同的效果。

::: tip-zh | 
[webpack-watched-glob-entries-plugin](https://www.npmjs.com/package/webpack-watched-glob-entries-plugin) 提供了一个实现它的工具。另外, 它支持 `webpack` 的 `watch` 模式, 因此当您修改入口时, `webpack` 也会进行更新。
:::

### 结论
当前的配置将样式与 `JavaScript` 巧妙地拆分开。尽管该技术对 `CSS` 最有价值, 但它可以用于将任何类型的模块提取到单独的文件中。<mark>MiniCssExtractPlugin</mark> 的难点在于它的配置, 但是复杂性可以隐藏在抽象背后。

回顾一下:
- 使用 <mark>MiniCssExtractPlugin</mark> 解决了**文档样式闪烁**(`FOUC`)的问题。同时, 将 `CSS` 与 `JavaScript` 拆分开可以改善缓存行为, 并消除了潜在的攻击媒介。
- 如果您不希望通过 `JavaScript` 来维护对样式的引用, 则可以选择通过入口处理它们。但是在这种情况下, 您必须谨慎对待样式顺序。

在下一章中, 您将学习如何从项目中清除未使用的 `CSS`。