## 加载样式
`Webpack` 无法直接处理样式, 您将不得不使用加载器和插件来加载样式文件。在本章中, 您将在 `webpack` 项目中设置 `CSS`, 并学会如何通过自动刷新浏览器来实现更新。当您对 `CSS` 进行更改时, 不必强制进行完全刷新。相反, 它可以在不使用 `CSS` 情况下修补 `CSS`。

### 加载 CSS
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

以下示例说明了如何通过 [postcss-loader](https://www.npmjs.com/package/postcss-loader) 使用 `PostCSS` 自动设置前缀。您可以将此技术与其他加载器混合使用, 以对所有 `CSS` 启用该功能。
```js
{
  test: /\.css$/,
  use: [
    "style-loader",
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        plugins: () => ([
          require("autoprefixer"),
          require("precss"),
        ]),
      },
    },
  ],
},
```
您必须记住要在项目中包含 [autoprefixer](https://www.npmjs.com/package/autoprefixer) 和 [precss](https://www.npmjs.com/package/precss), 才能正常工作。该技术将在["自动处理前缀"](./autoprefixing)一章中详细讨论。

::: tip-zh | 
`PostCSS` 支持基于 <mark>postcss.config.js</mark> 的配置。如果需要其他格式, 它内部依赖于 [cosmiconfig](https://www.npmjs.com/package/cosmiconfig)。
:::
::: tip-zh | 
[postcss-preset-env](https://www.npmjs.com/package/postcss-preset-env) 使用浏览器列表(`browserslist`)来确定要生成的 `CSS` 类型和加载的 `polyfill`。你可以把它看作 `CSS` 版本的 <mark>@babel/preset-env</mark>。后者将在["加载 JavaScript"]()一章中进行更详细的讨论。
:::

### 了解 css-loader 查找
为了充分利用 **`css-loader`**, 您应该了解它是如何执行查找的。尽管 **`css-loader`** 默认处理相对导入, 但在以下情况下它不起作用:
- 绝对路径导入: <mark>url("https://mydomain.com/static/demo.png")</mark>
- 根目录相对路径导入: <mark>url("/static/img/demo.png")</mark>

如果您依赖于这种类型的导入, 则必须按照["整理"]()一章中的做法, 将文件复制到项目中。[copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) 可以用于此目的, 但是您也可以将文件复制到 `webpack` 之外。前一种方法的好处是[开发服务器](../Developing/development-server)可以接管。

其他任何引入方式都将通过 `webpack` 进行, 并将尝试解析 <mark>url</mark> 和 <mark>@import</mark> 表达式。要禁用此默认行为, 请通过 `loader` 选项设置 **`css-loader`** 的 <mark>url: false</mark> 与 <mark>import: false</mark>。
::: tip-zh | 
如果使用 `Sass` 或 `Less`, 可以考虑使用 [resolve-url-loader](https://www.npmjs.com/package/resolve-url-loader)。它增加了对环境的相对导入的支持。
:::

### css-loader 处理导入
如果要 `css-loader` 以特定方式处理导入, 则应将 <mark>importLoaders</mark> 选项设置为一个数字, 该数字告诉加载器在找到的导入之后, 在执行css-loader之前应对其执行多少个加载器。如果您在 `CSS` 文件中通过 <mark>@import</mark> 语句导入其他 `CSS` 文件, 并希望通过特定的加载程序处理导入, 则此技术必不可少。

如果在 `CSS` 文件中导入以下内容:
```css
@import './variables.sass';
```

要处理 `Sass` 文件, 您必须编写如下配置:
```js{8}
{
  test: /\.css$/,
  use: [
    "style-loader",
    {
      loader: "css-loader",
      options: {
        importLoaders: 1,
      },
    },
    "sass-loader",
  ],
},
```
如果您在调用链中添加了更多加载器, 例如 *`postcss-loader`*, 则必须相应地调整 <mark>importLoaders</mark> 选项。

### 从 node_modules 目录加载
您可以直接从 *`node_modules`* 目录加载文件。参考 `Bootstrap` 及其用法。例如:
```css
@import "~bootstrap/less/bootstrap";
```

波浪号(`~`)告诉 `webpack` 它不是相对导入。如果包含波浪号, 它会查找 *`node_modules`* (默认设置), 当然也可以通过 [resolve.modules](https://webpack.js.org/configuration/resolve/#resolve-modules) 字段进行自定义。
::: warning-zh | 
如果您使用的是 `postcss-loader`, 您可以像 [postcss-loader issue tracker](https://github.com/postcss/postcss-loader/issues/166) 中讨论的那样, 不使用 `~`。`postcss-loader` 可以解析不带波浪号的导入。
:::

### 启用 source map
如果要为CSS启用 `source map`, 则应启用 `css-loader` 的 <mark>sourceMap</mark> 选项并设置输出(`output`)。并将 <mark>output.publicPath</mark> 设置为指向开发服务器的绝对路径。如果调用链中有多个加载器, 则必须为每一个加载器启用 `source map`。**`css-loader`** 中的 [issue 29](https://github.com/webpack/css-loader/issues/29) 进一步讨论了这个问题。

### 将 CSS 转化为字符串
您可以将 `CSS` 转化为字符串并将其推送到组件中, 这对 **`Angular 2`** 而言非常方便。[css-to-string-loader](https://www.npmjs.com/package/css-to-string-loader) 实现了这一点。[to-string-loader](https://www.npmjs.com/package/to-string-loader) 是另一个可选的解决方案。

### 使用 Bootstrap
有几种方式可以通过 `webpack` 使用 [Bootstrap](https://getbootstrap.com/)。第一种方式是使用 [npm 上的 bootstrap 包](https://www.npmjs.com/package/bootstrap) 并执行上面的加载器配置。

第二种方式是使用 [bootstrap-sass](https://www.npmjs.com/package/bootstrap-sass), 不过这种情况下, `sass-loader` 的精确度必须为 **`8`**。这是在 *`bootstrap-sass`* 中解释的[已知问题](https://www.npmjs.com/package/bootstrap-sass#sass-number-precision)。

第三种方式是通过 [bootstrap-loader](https://www.npmjs.com/package/bootstrap-loader)。它解决更多问题, 并允许自定义。

### 结论
`Webpack` 可以加载各种样式格式。默认情况下, 此处介绍的方法将样式写入 `JavaScript` 捆绑包。

回顾一下:
- **`css-loader`** 会解析样式中的 <mark>@import</mark> 和 <mark>url()</mark> 定义。**`style-loader`** 将其转换为 `JavaScript` 并实现 `webpack` 的 [HMR](../Appendices/hmr) 接口。
- `Webpack` 支持通过加载器编译各种 `CSS` 格式。包括 `Sass`, `Less` 与 `Stylus`。
- `PostCSS` 允许通过插件向 `CSS` 注入功能。`cssnext` 是 `PostCSS` 一个插件, 它实现了 `CSS` 的未来特性。
- **`css-loader`** 在默认情况下不会解析绝对路径导入与根目录相对路径导入。它允许通过 <mark>importLoaders</mark> 选项自定义装载器的行为。可以通过添加波浪号(`~`)前缀来对 *`mode_modules`* 进行查找。
- 要使用 `source map`, 必须为除 **`style-loader`** 之外的每个样式加载器启用 <mark>sourceMap</mark>。同时还必须设置 <mark>output.publicPath</mark> 指向开发服务器的绝对路径。
- 在 `webpack` 中使用 `Bootstrap` 时需要特别注意。您可以通过通用加载器或者 `Bootstrap` 的特定加载器来获取更多自定义选项。

尽管此处介绍的加载方法足以满足开发需求, 但对于生产而言并不理想。在下一章中, 您将了解为什么以及如何通过将 `CSS` 与源码分离来解决此问题。