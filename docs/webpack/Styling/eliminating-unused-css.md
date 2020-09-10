## 清除未使用的 CSS
诸如 [Bootstrap](https://getbootstrap.com/) 或 [Tailwind](https://tailwindcss.com/) 之类的框架往往自带了大量 `CSS` 样式。通常, 您只会使用其中的一小部分, 如果不进行任何处理, 会捆绑这些未使用的 `CSS` 样式。好在这个问题可以通过插件来解决。

[PurgeCSS](https://www.npmjs.com/package/purgecss) 是可以通过分析文件来实现清理 `CSS` 样式的插件。它遍历您的代码并找出正在使用的 `CSS` 类。通常, 有足够的信息让它从项目您的项目中清除未使用的 `CSS`。它在一定程度上也适用于单页应用程序。

[uncss](https://www.npmjs.com/package/uncss) 是一个不错的替代品。它通过 `PhantomJS` 运行, 并以不同的机制执行清除工作。您可以将 `uncss` 本身用作 `PostCSS` 的插件。[dropcss](https://www.npmjs.com/package/dropcss) 是另一种可选的插件。

鉴于 `PurgeCSS` 与 `webpack` 一起使用效果最佳, 我们将在本章中演示其用法。

### 设置 Tailwind
为了使演示更加逼真, 让我们将 `Tailwind` 安装到项目中:
```bash
npm add tailwindcss postcss-loader --develop
```
要加载 `Tailwind`, 我们必须使用 `PostCSS`:

**webpack.parts.js**
```js
exports.tailwind = () => ({
  loader: "postcss-loader",
  options: {
    // postcssOptions: {
        plugins: [require("tailwindcss")()],
    // }
  },
});
```
> 译者注: 如果使用 `PostCSS 4.x`, 请添加注释内容。

新的配置依旧需要进行连接:

**webpack.config.js**
```js{3,5-7,11-12}
const cssLoaders = [parts.tailwind()];

// const productionConfig = merge([parts.extractCSS()]);

const productionConfig = merge([
  parts.extractCSS({ loaders: cssLoaders }),
]);

const developmentConfig = merge([
  parts.devServer(),
  // parts.extractCSS({ options: { hmr: true } }),
  parts.extractCSS({ options: { hmr: true }, loaders: cssLoaders }),

]);
```

要在项目中使用 `Tailwind`, 需要在 `CSS` 中使用 `import` 引入:

**src/main.css**
```css
@tailwind base;
@tailwind components;

/* Write your utility classes here */

@tailwind utilities;

body {
  background: cornsilk;
}
```

### 使用 Tailwind 类
您还应该让演示组件使用 `Tailwind` 类, 因此可以使用以下方法:

**src/component.js**
```js
export default (text = "Hello world") => {
  const element = document.createElement("div");

  element.className = "rounded bg-red-100 border max-w-md m-4 p-4";
  element.innerHTML = text;

  return element;
};
```

如果运行应用程序(`npm start`), 则 `"Hello world"` 应该看起来像一个按钮。
![hello world!](../../style/hello_style.webp)

构建应用程序(`npm run build`)应该会在控制台输出:
```bash{6}
⬡ webpack: Build Finished
⬡ webpack: Hash: 2b83e88cf64c16dd9adc
  Version: webpack 5.0.0-beta.29
  Time: 3264 ms
  Built at: 2020-09-10 14:34:57
  asset ./css/main.css 1.96 MiB [emitted] [big] (name: main)
  asset index.html 243 bytes [emitted]
  asset main.js 14.7 KiB [emitted] [minimized] (name: main)
  ......
```

如您所见, `CSS` 样式文件的大小增加了, 这是需要使用 `PurgeCSS` 解决的问题。

### 清除 CSS
[purgecss-webpack-plugin](https://www.npmjs.com/package/purgecss-webpack-plugin) 允许您清除未使用的 `CSS` 样式, 因为理想情况下, 我们仅应当打包我们正在使用的 `CSS` 类。
```bash
npm add glob purgecss-webpack-plugin --develop
```

您还需要进行如下配置:

**webpack.parts.js**
```js
const path = require("path");
const glob = require("glob");
const PurgeCSSPlugin = require("purgecss-webpack-plugin");

const ALL_FILES = glob.sync(path.join(__dirname, "src/*.js"));

exports.eliminateUnusedCSS = () => ({
  plugins: [
    new PurgeCSSPlugin({
      whitelistPatterns: [], // Example: /^svg-/
      paths: ALL_FILES, // Consider extracting as a parameter
      extractors: [
        {
          extractor: (content) =>
            content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
          extensions: ["html"],
        },
      ],
    }),
  ],
});
```

接下来将 `PurgeCSS` 连接到配置中。该插件必须在 `MiniCssExtractPlugin` 之后使用, 否则无效。

**webpack.config.js**
```js{3}
const productionConfig = merge([
  parts.extractCSS({ loaders: cssLoaders }),
  parts.eliminateUnusedCSS(),
]);
```
`CSS` 相关调用的顺序并不重要, 因为插件将注册到构建的不同部分。

如果立即执行 <mark>npm run build</mark>, 应该会看到以下内容:
```bash{6}
⬡ webpack: Build Finished
⬡ webpack: Hash: 2b83e88cf64c16dd9adc
  Version: webpack 5.0.0-beta.29
  Time: 3872 ms
  Built at: 2020-09-10 14:47:36
  asset ./css/main.css 7.77 KiB [emitted] (name: main)
  asset index.html 243 bytes [emitted]
  asset main.js 14.7 KiB [emitted] [minimized] (name: main)
  ......
```

样式文件的大小已明显减小, 原本为 `1.96MB` 现在大约只有 `7KB`。这对于更加庞大的 `CSS` 框架而言, 效果更加显著。

::: warning-zh | 
`Tailwind` 包含了开箱即用地 `PurgeCSS`, 最好使用它。有关更多信息, 请参见 [Tailwind 文档](https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css)。上面的示例足以实现该想法, 并且可以通用。
:::

### 关键路径渲染
[关键路径渲染](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/)的想法从另一个角度看待 `CSS` 性能。它没有优化大小, 而是优化了渲染顺序并强调了首屏 `CSS` 样式。通过呈现页面, 然后弄清楚需要哪些样式才能获得想要显示的结果, 从而获得结果。

Addy Osmani 撰写的 [critical-path-css-tools](https://github.com/addyosmani/critical-path-css-tools) 列出了与该方法相关的工具。

### 结论
使用 `PurgeCSS` 可以大大减少样式文件的大小。对于依赖大型 `CSS` 框架的静态网站而言, 它尤其有价值。网站或应用程序变得越动态, 就越难以可靠地进行分析。

回顾一下:
- 使用 `PurgeCSS` 可以清除未使用的 `CSS`。它对源文件执行静态分析。
- 可以通过 **`purgecss-webpack-plugin`** 启用该功能。
- 实际上, `PurgeCSS` 可以清除大多数(如果不是全部)未使用的 `CSS` 样式。
- 关键路径渲染是另一种 `CSS` 技术, 该技术强调首先渲染屏幕上的 `CSS` 样式。想法是尽可能快地渲染一些东西, 而不是等待所有 `CSS` 加载完毕。

在下一章中, 您将学习自动处理前缀。启用该功能使生产版本适用于旧版浏览器的复杂 `CSS` 更加方便。