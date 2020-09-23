## 在文件名中添加哈希
即使生成的构建可以工作, 但它使用的文件名还是有问题的。它无法有效地利用客户端的缓存机制, 因为无法判断文件是否已更改。缓存失效可以通过在文件名中添加哈希来实现。

::: tip-zh | 
从 `webpack 5` 开始, `webpack` 使用确定性的方式生成文件名, 这是在包大小和长时间缓存之间的一个很好的折衷方案。该行为可以通过 `optimization.moduleIds` 和 `optimization.chunkIds` 控制。后一种适用于[代码拆分](../Building/code-splitting)。
:::

### 占位符
`Webpack` 为此提供了**占位符**。这些字符串用于将特定信息附加到 `webpack` 输出。其中最有价值的是:
- `[id]`: 返回块 **ID**。
- `[path]`: 返回文件路径。
- `[name]`: 返回文件名。
- `[ext]`: 返回扩展名。`[ext]` 适用于大多数可用字段。
- `[fullhash]`: 返回构建哈希。如果构建的任何部分发生更改, 则此哈希也将更改。在 `webpack 5` 或更低版本中, 它是 `[hash]`。
- `[chunkhash]`: 返回特定于入口块的哈希。配置中定义的每个入口都会接收其自己的哈希。如果入口的任何部分发生变化, 则哈希值也将发生变化。 `[chunkhash]` 比 `[fullhash]` 定义更精细。
- `[contenthash]`: 返回基于内容生成的哈希。从 `webpack 5` 开始, 这是生产模式下的新默认设置。

最好只将 `hash` 与 `contenthash` 用于生产模式, 因为在开发过程中哈希并没有太大的好处。

::: tip-zh | 
可以使用特定的语法对 `hash` 和 `contenthash` 进行切片: `[contenthash:4]`。这样将生成 `8c4c`, 而不是 `8c4cbfdb91ff93f3f3c5` 这样的哈希。
:::
::: tip-zh | 
还有更多选项可用, 您甚至可以按照 [loader-utils](https://www.npmjs.com/package/loader-utils#interpolatename) 文档中的说明修改哈希和摘要类型。
:::
::: warning-zh | 
如果您使用的是 `webpack 4`, 请谨慎操作, 因为 [`contenthash` 并不完全可靠](https://github.com/webpack/webpack/issues/11146)。有可能 `chunkhash` 是最佳的选项。`Webpack 5` 为此提供了更好的解决方案。
:::

### 占位符示例
假设您正在使用以下配置:
```js
{
  output: {
    path: PATHS.build,
    filename: "[name].[contenthash].js",
  },
},
```
`Webpack` 将基于它生成如下文件名:
```js
main.d587bbd6e38337f5accd.js
vendor.dc746a5db4ed650296e1.js
```

如果与块相关的文件内容不同, 则哈希也将变更, 从而使缓存无效。更准确地说, 浏览器向文件发送新请求。如果仅 `main` 需要更新, 则仅需要再次请求该文件。

通过生成静态文件名(即 `main.js?d587bbd6e38337f5accd`)并通过查询字符串使缓存无效, 可以实现相同的结果。问号后面的部分会使缓存无效的哈希。根据 [Steve Souders 的说法](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), 将哈希值附加到文件名是最有效的选择。

### 设置哈希
当前配置需要进行调整以生成适当的哈希值。调整如下:

**webpack.config.js**
```js{7,9,16-21}
const commonConfig = merge([
  ......
  parts.loadImages({
    options: {
      limit: 15000,

    //   name: "[name].[ext]",

      name: "[name].[contenthash:4].[ext]",
    },
  }),
  ......
])

const productionConfig = merge([
  {
    output: {
      chunkFilename: "[name].[contenthash:4].js",
      filename: "[name].[contenthash:4].js",
    },
  },
  ......
]);
```

为了确保提取的 `CSS` 也正确使用哈希, 请调整:

**webpack.parts.js**
```js{7,9}
exports.extractCSS = ({ options = {}, loaders = [] } = {}) => {
  return {
    ......
    plugins: [
      new MiniCssExtractPlugin({

        // filename: "[name].css",

        filename: "[name].[contenthash:4].css",
      }),
    ],
  };
};
```
如果您现在生成一个构建(`npm run build`), 则应该看到以下内容:
```bash
⬡ webpack: Build Finished
⬡ webpack: Hash: d33ed83f3028667c8738
  Version: webpack 5.0.0-beta.29
  Time: 11657 ms
  Built at: 2020-09-23 14:23:50
  asset 34.b55b.js 201 bytes [emitted] [immutable] [minimized] 1 related asset
  asset 728.7dfb.js 139 KiB [emitted] [immutable] [minimized] (id hint: vendors) 2 related assets
  asset index.html 282 bytes [emitted]
  asset logo.37c9.jpg 515 KiB [emitted] [immutable] [big] (auxiliary name: main)
  asset main.38f4.js 2.93 KiB [emitted] [immutable] [minimized] (name: main) 1 related asset
  asset main.be03.css 1.15 KiB [emitted] [immutable] (name: main)
  Entrypoint main = 728.7dfb.js main.be03.css main.38f4.js (728.a197.js.map logo.37c9.jpg main.c9ba.js.map)
```

这些文件现在有了整洁的哈希。为了证明它对样式有效, 您可以尝试更改 `src/main.css` 看看您重建时哈希是否会发生改变。

::: warning-zh | 
为了使输出更适合书中的内容, 哈希值已被切分。实际上, 您可以跳过切片。
:::

### 结论
将与文件内容相关的哈希值包含到它们的名称中, 可以在客户端使它们失效。如果哈希值已更改, 则客户端将再次下载该资源。

回顾一下:
- `Webpack` 的**占位符**允许您调整文件名, 并允许您在其中包含哈希。
- 最有价值的占位符 `[name]`, `[contenthash]` 和 `[ext]`。`contenthash` 基于块内容导出哈希值。
- 如果您使用 `MiniCssExtractPlugin`, 则也应该使用 `[contenthash]`。这样, 仅当内容更改时, 生成的资源才会失效。

即使项目现在生成哈希, 输出也不是完美无缺的。问题是, 如果应用程序发生更改, 它也会使供应商捆绑包失效。下一章将深入讨论这个主题, 并向您展示如何提取 `webpack` **运行时**来解决这个问题。