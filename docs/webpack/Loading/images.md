## 加载图片
在开发网站和应用程序时, 图像加载和处理可能是一个问题。这个问题可以通过将图像推送到一个单独的服务来解决, 该服务负责优化它们并提供一个用于消费它们的接口。

对于较小规模的使用, `webpack` 是一个不错的选择, 因为它可以使用和处理图像。这样做会产生构建开销, 具体取决于您要执行的操作类型。

`Webpack` 可以使用 [url-loader](https://www.npmjs.com/package/url-loader) 内联资源。它将图像作为 `JavaScript` 包中的 `base64` 字符串产出。该过程在增大捆绑包大小的同时减少了所需的请求数。

`Webpack` 可以控制内联过程, 并且可以将加载推迟到 [file-loader](https://www.npmjs.com/package/file-loader)。**`file-loader`** 输出图像文件并返回它们的路径, 而不是内联。如后面的章节所述, 该技术可与其他资源类型一起使用, 例如字体。

### 配置 url-loader
**`url-loader`** 是一个很好的起点, 它是用于开发目的的理想选择, 因为您不必担心生成的包的大小。它带有 *`limitt`* 选项, 可在达到绝对限制后将图像生成推迟到**文件加载器**。这样, 您可以将小文件内联到 `JavaScript` 包中, 同时为大文件生成单独的文件。

如果使用该 `limit` 选项, 则需要将 **`url-loader`** 和 **`file-loader`** 都安装到项目中。假设您已经正确配置了样式, 则 `webpack` 会解析样式中包含的所有 `url()` 语句。您也可以通过 `JavaScript` 代码指向图像资源。

如果使用该 `limit` 选项, 则 **`url-loader`** 将可能的其他选项传递给 **`file-loader`**, 从而可以进一步配置其行为。

要在内联 `25kB` 以下的文件时加载 `.jpg` 和 `.png` 文件, 必须设置加载器:
```js
{
  test: /\.(jpg|png)$/,
  use: {
    loader: "url-loader",
    options: {
      limit: 25000,
    },
  },
},
```
::: tip-zh | 
如果您希望在达到限制时使用另一个加载器而不是 **`file-loader`**, 请设置 <mark>fallback："some-loader"</mark>。然后 `webpack` 将解析为当前配置值, 而不是使用默认值。
:::

### 配置 file-loader
如果要直接跳过内联, 则可以直接使用 **`file-loader`**。以下配置自定义生成的文件名。默认情况下, **`file-loader`** 返回文件内容的 `MD5` 哈希值与原始扩展名:
```js
{
  test: /\.(jpg|png)$/,
  use: {
    loader: "file-loader",
    options: {
      name: "[path][name].[hash].[ext]",
    },
  },
},
```
::: tip-zh | 
如果要在特定目录下输出图像, 请使用进行配置 <mark>name: "./images/[hash].[ext]"</mark>。
:::
::: warning-zh | 
注意不要在图像上同时应用两个加载器! 如果 **`url-loader`** 的 `limit` 无法满足需求, 请使用该 `include` 字段进行进一步控制。
:::

### 将图像集成到项目中
可以将上述想法封装在一个小的帮助程序中, 该帮助程序可以合并到本书项目中。首先, 安装依赖项:
```bash
npm add url-loader file-loader --develop
```

配置如下功能:

**webpack.parts.js**
```js
exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        include,
        exclude,
        use: {
          loader: "url-loader",
          options,
        },
      },
    ],
  },
});
```
要将其附加到配置, 请进行如下调整:

**webpack.config.js**
```js{3-8}
const commonConfig = merge([
  ......
  parts.loadImages({
    options: {
      limit: 15000,
      name: "[name].[ext]",
    },
  }),
]);
```
要测试设置是否有效, 请下载图像或生成图像(`convert -size 100x100 gradient:blue logo.png`), 然后从项目中引用它:

**src/main.css**
```css{4-6}
body {
  background: cornsilk;

  background-image: url("./logo.png");
  background-repeat: no-repeat;
  background-position: center;
}
```

行为根据您的 `limit` 设置而变化。低于限制时, 它应该内嵌图像, 而超过限制时, 它应该发出单独的资源和通往它的路径。`CSS` 查找工作是由于 `css-loader` 引起的。您也可以尝试从 `JavaScript` 代码导入图像, 然后看看会发生什么。

### 加载 SVG
`Webpack` 提供了[几种](https://github.com/webpack/webpack/issues/595)加载 `SVG` 的方法。但是, 最简单的方法是通过 **`file-loader`**, 如下所示:
```js
{
  test: /\.svg$/,
  use: "file-loader",
},
```

假设您已经正确设置了样式, 则可以参考以下 `SVG` 文件。下面的示例 `SVG` 路径是相对于 `CSS` 文件的:
```css
.icon {
  background-image: url("../assets/icon.svg");
}
```

还可以使用以下加载器:
- [raw-loader](https://www.npmjs.com/package/raw-loader) 可访问原始 `SVG` 内容。
- [svg-inline-loader](https://www.npmjs.com/package/svg-inline-loader) 更进一步, 并消除了 `SVG` 中不必要的标记。
- [svg-sprite-loader](https://www.npmjs.com/package/svg-sprite-loader) 可以将单独的 `SVG` 文件合并到单个 `sprite` 中, 从而可以避免请求开销, 从而提高加载效率。它也支持光栅图像(`.jpg`, `.png`)。
- [svg-url-loader](https://www.npmjs.com/package/svg-url-loader) 将 `SVG` 作为 `UTF-8` 编码的数据 `URL` 加载。结果比 `base64` 更小且解析速度更快。
- [@svgr/webpack](https://www.npmjs.com/package/@svgr/webpack) 将导入的 `SVG` 公开为要使用的 `React` 组件。

::: tip-zh | 
您仍然可以对 `SVG` 使用 **`url-loader`** 和上面的提示。
:::

### 优化图像
如果要压缩图像, 请使用 [image-webpack-loader](https://www.npmjs.com/package/image-webpack-loader), [svgo-loader](https://www.npmjs.com/package/svgo-loader) (特定于 `SVG`)或 [imagemin-webpack-plugin](https://www.npmjs.com/package/imagemin-webpack-plugin)。这种类型的加载程序应首先应用于数据, 因此请记住将其作为 `use` 列表中的最后一个放置。

压缩对于生产版本特别有价值, 因为压缩可以减少下载图像资源所需的带宽量, 从而加快网站或应用程序的速度。

### 利用 srcset
[resize-image-loader](https://www.npmjs.com/package/resize-image-loader) 和 [active-loader](https://www.npmjs.com/package/responsive-loader) 允许您为现代浏览器生成 `srcset` 兼容的图像集合。`srcset` 使浏览器能够更好地控制要加载的图像以及何时可以获得更高的性能。

### 动态加载图像
`Webpack` 允许您根据条件动态加载图像。为此, ["代码拆分"]()和["动态加载']()一章中介绍的技术就足够了。这样做可以节省带宽并仅在需要时加载图像, 或者在有时间时预加载图像。

### 加载精灵图
`sprite` 技术允许您将多个较小的图像组合成一个图像。它已经被用于游戏来描述动画, 对于 `web` 开发和避免请求开销都很有价值。

[webpack-spritesmith](https://www.npmjs.com/package/webpack-spritesmith) 将提供的图像转换为 `sprite` 表和 `Sass/Less/Stylus mixins`。您必须设置一个 `SpritesmithPlugin`, 将其指向目标图像, 并设置生成的 `mixin` 的名称。在那之后, 你的样式可以得到它:
```css
@import "~sprite.sass";

.close-button {
  sprite($close);
}

.open-button {
  sprite($open);
}
```

### 使用占位符
[image-trace-loader](https://www.npmjs.com/package/image-trace-loader) 加载图像并将结果显示为 `image/svg+xmlURL` 编码数据。它可以与 `file-loader` 和 `url-loader` 结合使用, 以在加载实际图像时显示占位符。

[lqip-loader](https://www.npmjs.com/package/lqip-loader) 实现了类似的想法。它提供的是模糊图像, 而不是跟踪图像。

### 获取图像尺寸
有时仅获得图像引用是不够的。除了引用图像本身之外, [image-size-loader](https://www.npmjs.com/package/image-size-loader) 还抛出图像尺寸, 类型和大小。

### 加载 srcset
现代浏览器支持的 `srcset` 属性可让您定义不同分辨率的图像。然后, 浏览器可以选择最适合显示的一种。主要选项是 [html-loader-srcset](https://www.npmjs.com/package/html-loader-srcset) 和 [responsive-loader](https://www.npmjs.com/package/responsive-loader)。

### 引用图像
假设 `css-loader` 已经配置, `webpack` 可以通过 `@import` 和 `url()` 从样式表中获取图像。您也可以在代码中引用您的图像。在这种情况下, 必须显式导入文件:
```js
import src from "./avatar.png";

// Use the image in your code somehow now
const Profile = () => <img src={src} />;
```

如果您使用的是 `React`, 则可以使用 [babel-plugin-transform-react-jsx-img-import](https://www.npmjs.com/package/babel-plugin-transform-react-jsx-img-import) 来自动生成 `require`。在这种情况下, 您将获得以下代码:
```jsx
const Profile = () => <img src="avatar.png" />;
```
如[代码拆分]()一章中所述, 也可以设置动态导入。这是一个小例子:
```js
const src = require(`./avatars/${avatar}`);
```

### 图像和 css-loader source map
如果在启用了 `sourceMap` 选项的情况下使用图片和 **`css-loader`**, 则将其 `output.publicPath` 配置为指向开发服务器的绝对值很重要。否则, 图像将无法正常加载。有关更多说明, 请参见[相关的 webpack 问题](https://github.com/webpack/style-loader/issues/55)。

### 结论
`Webpack` 允许您在需要时内联图像到捆绑包中。为图像找出适当的内联限制需要进行实验。您必须在分发包大小和请求数量之间取得平衡。

回顾一下:
- **`url-loader`** 内联图像到 `JavaScript` 中。它带有一个 `limit` 选项, 允许您将大于限制的资源推迟到 **`file-loader`**。
- **`file-loader`** 产出图像资源, 并将它们的路径返回到代码。它允许哈希资源名称。
- 您可以找到与图像优化相关的加载器和插件, 使您可以进一步调整其大小。
- 可以从较小的图像中生成 `sprite` 表, 以将它们组合为单个请求。
- `Webpack` 允许您根据给定条件动态加载图像。
- 如果使用的是 `source map`, 则应记住将其设置 `output.publicPath` 为显示图像服务器的绝对值。

在下一章中, 您将学习使用 `webpack` 加载字体。