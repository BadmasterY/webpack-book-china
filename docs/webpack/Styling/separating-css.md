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
使用此设置, 您仍可以在开发过程中享受来自 `HMR` 的便利性。对于生产版本, 可以生成单独的 `CSS` 文件。<mark>HtmlWebpackPlugin</mark> 自动将其拾取并将其注入 `index.html`。