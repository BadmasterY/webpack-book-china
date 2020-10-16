## 加载字体
加载字体类似于加载图像。但是, 它确实带来了独特的挑战。如何知道要支持哪些字体格式? 如果要为每个浏览器提供一流的支持, 则最多需要考虑四种字体格式。

可以通过确定一组应该获得一流服务的浏览器和平台来解决该问题。其余的可以使用系统字体。

您可以通过 `webpack` 以多种方式解决此问题。您仍然可以像图片一样使用 **`url-loader`** 和 **`file-loader`**。但是, 字体 `test` 模式往往更复杂, 因此您必须为字体文件相关的查找发愁。

::: tip-zh | 
[canifon](https://www.npmjs.com/package/canifont) 可帮助您确t定应支持的字体格式。它使用 **`.browserslistrc`** 定义, 然后根据该定义检查每个浏览器的字体支持。
:::

### 选择要支持的格式
如果您排除 `Opera Mini`, 则所有浏览器都支持 `.woff` 格式。它的较新版本 `.woff2` 受到现代浏览器的广泛支持, 可以作为不错的选择。

使用一种格式, 您可以使用与图像类似的设置, 并在使用 `limit` 选项的同时依赖 **`file-loader`** 和 **`url-loader`**:
```js
{
  test: /\.woff$/,
  use: {
    loader: "url-loader",
    options: {
      limit: 50000,
    },
  },
},
```
一种更为详细的方法实现类似结果(包括 `.woff2` 和其他字体), 最终得到如下代码:
```js
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
  use: {
    loader: "url-loader",
    options: {
      // Limit at 50k. Above that it emits separate files
      limit: 50000,

      // url-loader sets mimetype if it's passed.
      // Without this it derives it from the file extension
      mimetype: "application/font-woff",

      // Output below fonts directory
      name: "./fonts/[name].[ext]",
    }
  },
},
```
### 支持多种格式
如果您想确保网站在尽可能多的浏览器上看起来不错, 您可以使用 **`file-laoder`** 而不必考虑内联。同样, 您将需要额外的请求加载字体, 这是一种权衡, 但也许这是正确的做法。在这里, 您可以得到一个加载器配置:
```js
{
  test: /\.(ttf|eot|woff|woff2)$/,
  use: {
    loader: "file-loader",
    options: {
      name: "fonts/[name].[ext]",
    },
  },
},
```

编写 `CSS` 定义的方式很重要。为确保您从新字体中受益, 它们应在定义中的第一位。这样, 浏览器就可以获取它们。

```css
@font-face {
  font-family: "myfontfamily";
  src: url("./fonts/myfontfile.woff2") format("woff2"), url("./fonts/myfontfile.woff")
      format("woff"),
    url("./fonts/myfontfile.eot") format("embedded-opentype"), url("./fonts/myfontfile.ttf")
      format("truetype");
  /* Add other formats as you see fit */
}
```

::: tip-zh | 
[MDN 详细讨论了字体系列规则](https://developer.mozilla.org/en/docs/Web/CSS/@font-face)。
:::

### 操作 file-loader 输出路径和 publicPath
如 [webpack issue 32](https://github.com/webpack/file-loader/issues/32#issuecomment-250622904) 中所述, **`file-loader`** 允许对输出进行调整。这样, 您可以在 `fonts/` 下方输出字体, 在 `images/` 下方输出图片等等。

此外, 可以修改 `publicPath` 和覆盖每个加载器定义的默认值。下面的示例一起说明了这些技术:
```js
{
  // Match woff2 and patterns like .woff?v=1.1.1.
  test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
  use: {
    loader: "url-loader",
    options: {
      limit: 50000,
      mimetype: "application/font-woff",
      name: "./fonts/[name].[ext]", // Output below ./fonts
      publicPath: "../", // Take the directory into account
    },
  },
},
```
::: tip-zh | 
在上面的示例中, **`file-loader`** 的行为被 **`url-loader`** 遮盖了。它通过 `limit` 选项来调用 **`file-loader`**。加载器选项将传递给 **`url-loader`**。您可以通过使用 `fallback` 选项来覆盖行为。
:::

### 基于 SVG 生成字体文件
如果您更喜欢使用基于 `SVG` 的字体, 则可以使用 [webfonts-loader](https://www.npmjs.com/package/webfonts-loader) 将它们打包为一个字体文件。
::: warning-zh | 
如果已经进行了专用于 `SVG` 图片的配置, 请小心 `SVG` 图片。如果要以不同方式处理字体 `SVG`, 请仔细配置其定义。["加载器定义"](../Loading/loader-definitions)一章介绍了备选方法。
:::

### 使用 Goolgle 字体
[@beyonk/google-fonts-webpack-plugin](https://www.npmjs.com/package/@beyonk/google-fonts-webpack-plugin) 可以将 `Google` 字体下载到 `webpack` 构建目录或使用 `CDN` 连接到它们。

### 使用 icon 字体
[iconfont-webpack-plugin](https://www.npmjs.com/package/iconfont-webpack-plugin) 旨在简化基于 `icon` 的字体的加载。它在 `CSS` 文件中内联 `SVG`。

要确保仅包含需要的 `icon`, 请使用 [fontmin-webpack](https://www.npmjs.com/package/fontmin-webpack)。

### 清除未使用的字体
[subfont](https://www.npmjs.com/package/subfont) 是一种可对 `webpack` 的 `HTML` 输出执行静态分析, 然后重写字体以仅包含所使用的字体的工具。字体子集内嵌过程可以极大地减小字体文件的大小。

### 结论
加载字体类似于加载其他资源。您必须考虑要支持的浏览器, 然后根据该浏览器选择加载策略。

回顾一下:
- 加载字体时, 将使用与加载图片相同的技术。您可以选择内嵌小字体, 而将大字体生成单独的资源。
- 如果决定仅为现代浏览器提供支持, 则只需要选择一种或两种字体格式, 并允许较旧的浏览器使用系统字体。

在下一章中, 您将学习使用 `Babel` 和 `webpack` 加载 `JavaScript`。`Webpack` 默认情况下会加载 `JavaScript`, 但是该主题还有更多内容, 因为您必须考虑要支持哪些浏览器。
