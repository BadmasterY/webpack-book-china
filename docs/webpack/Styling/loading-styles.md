## 载入样式
`Webpack` 无法直接处理样式, 您将不得不使用加载器和插件来加载样式文件。在本章中, 您将在 `webpack` 项目中设置 `CSS`, 并学会如何通过自动刷新浏览器来实现更新。当您对 `CSS` 进行更改时, 不必强制进行完全刷新。相反, 它可以在不使用 `CSS` 情况下修补 `CSS`。

### 载入 CSS
要加载 `CSS`, 您需要使用 [css-loader](https://www.npmjs.com/package/css-loader) 和 [style-loader](https://www.npmjs.com/package/style-loader)。

**css-loader** 在匹配的文件中查找 <mark>@import</mark> 和 <mark>url()</mark>, 并将它们视为常规的 `ES2015` <mark>import</mark>。如果一个 <mark>@import</mark> 指向外部文件, **css-loader** 将跳过它, 因为只有内部资源会被 `webpack` 进一步处理。

**style-loader** 通过 <mark>style</mark> 元素注入样式, 同时可以自定义其执行方式。它还实现了[模块热更新](../Appendices/hmr.html)接口, 提供更好的开发体验。

匹配的文件可以通过 [file-loader](https://www.npmjs.com/package/file-loader) 或者 [url-loader](https://www.npmjs.com/package/url-loader) 之类的加载器进行处理, 这些可能的加载器将在本书的 **"Loading"** 部分进行讨论。

由于内联 `CSS` 并不是用于生产用途的好主意, 因此使用 <mark>MiniCssExtractPlugin</mark> 来生成单独的 `CSS` 文件是有意义的。您将在下一章中进行此操作。

首先, 请调用:
```bash
npm add css-loader style-loader --develop
```
现在, 让我们确保 `webpack` 知道它们。在 `webpack.parts.js` 的末尾添加新的函数:

**webpack.parts.js**
```js
exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
```
以上表示以 <mark>.css</mark> 结尾的文件应调用给定的加载器。

加载器返回新的源文件, 并对其应用转换。它们可以像 `Unix` 中的管道一样链接在一起, 并从右到左求值。这意味着 <mark>loaders: ["style-loader", "css-loader"]</mark> 可以理解为 <mark>styleLoader(cssLoader(input))</mark>。

您还需要将 `webpack.parts.js` 连接到 `webpack` 配置:

**webpack.config.js**
```js{3}
const commonConfig = merge([
  ......
  parts.loadCSS(),
]);
```
### 设置初始 CSS
您仍然缺少 `CSS` 文件:

**src/main.css**
```css
body {
  background: cornsilk;
}
```
为了使 `webpack` 知道有这个 `CSS` 文件, 我们必须从源代码中引用它:

**src/index.js**
```js{1}
import "./main.css";
......
```

执行 <mark>npm start</mark> 并查看使用的端口, 默认情况下为 <mark>http://localhost:8080</mark>。然后打开 `main.css` 并将背景色更改为类似 `lime`(`background: lime`)的颜色。
![hello world!](../../style/hello_css.png)

### 使用 CSS 预处理器
`Webpack` 为以下最受欢迎的 `CSS` 预处理方法提供支持:
- 要使用 `Less` 预处理器, 请参见 [less-loader](https://www.npmjs.com/package/less-loader)。
- `Sass` 需要使用 [sass-loader](https://www.npmjs.com/package/sass-loader) 或 [fast-sass-loader](https://www.npmjs.com/package/fast-sass-loader) (性能更高)。在这两种情况下, 都应在加载器内定义 **css-loader** 之后添加加载器。
- 对于 `Stylus`, 请参阅 [stylus-loader](https://www.npmjs.com/package/less-loader)。

有关 `css-in-js` 的任何相关信息, 请参阅特定解决方案的文档。这些选项经常都可以很好地支持 `webpack`。

::: tip-zh | 
该[CSS 模块](../Appendices/css-modules.html)附录介绍了一种方法, 可以让你在默认情况下对待本地文件。它规避了 `CSS` 的作用域问题。
:::

### PostCSS
[PostCSS](http://postcss.org/) 允许您通过 `JavaScript` 插件对 `CSS` 执行转换。`PostCSS` 相当于样式版的 `Babel`, 您可以找到许多用于此目的的插件。它可以模仿 `Sass` 语法([precss](https://www.npmjs.com/package/precss)), 甚至可以修复浏览器错误, 例如`Safari` 上的 <mark>100vh</mark> 行为: [postcss-100vh-fix](https://www.npmjs.com/package/postcss-100vh-fix)。

以下示例说明了如何使用带有 [postcss-loader](https://www.npmjs.com/package/postcss-loader) 的 `PostCSS` 设置自动前缀。您可以将此技术与其他加载器混合使用, 以对所有 `CSS` 启用自动前缀。