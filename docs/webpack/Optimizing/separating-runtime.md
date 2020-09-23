## 分离运行时
当webpack编写捆绑包时, 它还维护一个运行时。运行时包含最初要加载的文件的清单。如果文件名发生更改, 则清单将更改, 并且更改将使包含该文件的文件失效。

因此, 最好将运行时写入其自己的文件或将清单信息内联到项目的 `index.html` 文件中。

### 提取运行时
在["捆绑拆分"](../Building/bundle-splitting)一章中进行 `extractBundles` 设置时, 已经完成了大多数工作。要提取运行时, 请定义 `optimization.runtimeChunk` 如下:

**webpack.config.js**
```js{8-10}
const productionConfig = merge([
  ......
  {
    optimization: {
      splitChunks: {
        ......
      },
      runtimeChunk: {
        name: "runtime",
      },
    },
  },
]);
```
该名称按惯例使用 `runtime`。您可以使用任何其他名称, 并且仍然可以正常使用。

如果您现在构建(`npm run build`)项目, 则应该看到以下内容:
```bash
⬡ webpack: Build Finished
⬡ webpack: Hash: 0393e1f7c7636f66b56d
  Version: webpack 5.0.0-beta.29
  Time: 13173 ms
  Built at: 2020-09-23 15:05:21
  asset 34.b55b.js 201 bytes [emitted] [immutable] [minimized] 1 related asset
  asset 728.7dfb.js 139 KiB [emitted] [immutable] [minimized] (id hint: vendors) 2 related assets
  asset index.html 321 bytes [emitted]
  asset logo.37c9.jpg 515 KiB [emitted] [immutable] [big] (auxiliary name: main)
  asset main.be03.css 1.15 KiB [emitted] [immutable] (name: main)
  asset main.c442.js 659 bytes [emitted] [immutable] [minimized] (name: main) 1 related asset
  asset runtime.e392.js 2.43 KiB [emitted] [immutable] [minimized] (name: runtime) 1 related asset
  Entrypoint main = runtime.e392.js 728.7dfb.js main.be03.css main.c442.js (728.a197.js.map logo.37c9.jpg main.2959.js.map runtime.6590.js.map)
  ......
```

此更改提供了一个包含运行时的单独文件。在上面的输出中, 它被标记为 `runtime` 块名。因为安装程序使用的是 `MiniHtmlWebpackPlugin`, 所以无需担心自己加载清单, 因为插件在 `index.html` 中添加了对其的引用。

尝试调整 `src/index.js` 看看哈希是如何变化的。这一次它应该**不会**使供应商捆绑包失效, 只有运行时和应用程序捆绑包的名称应该发生变化。

::: tip-zh | 
从 `webpack 5` 开始, 可以使用 `output.ecmaVersion` 定义运行时的写入格式。将其设置为 `5` 将产出 `ECMAScript 5` 兼容代码, 而将其设置为 `2015` 将为较新的目标生成较短的代码。设置也会影响[压缩](./minifying)过程。
:::
::: tip-zh | 
为了更好地了解运行时的内容, 可以在开发模式下运行, 或者通过配置将 `none` 传递给 `mode`。您应该在那里看到一些熟悉的东西。
:::
::: tip-zh |
通过 `CDN` 加载流行的依赖项(如 `React`), 可以进一步改进构建。这将进一步减小供应商捆绑包的大小, 同时增加对项目的外部依赖性。其想法是, 如果用户较早地访问了 `CDN`, 缓存可以像这里一样启动。
:::

### 使用 records
正如在["捆绑拆分"](../Building/bundle-splitting)一章中所暗示的, `AggressiveSplittingPlugin` 和其他插件使用 `records` 来实现缓存。上面讨论的方法仍然有效, 但是 `records` 更进一步。

`Records` 用于在单独的构建中存储模块 `ID`。问题是您需要保存此文件。如果在本地构建, 则一种选择是将其包含在版本控制中。

要生成 `records.json` 文件, 请如下调整配置:

**webpack.config.js**
```js{1,6}
const path = require('path');
......
const productionConfig = merge([
  {
    ......
    recordsPath: path.join(__dirname, "records.json"),
  },
  ......
]);
```
如果您构建项目(`npm run build`), 则应该在项目根目录下看到一个新文件 `records.json`。下次构建 `webpack` 时, 它将获取信息并在文件已更改的情况下重写文件。

如果您使用代码拆分进行了复杂的设置, 并且想要确保拆分的部分获得正确的缓存行为, 则 `records` 特别有价值。最大的问题是维护该文件。

::: tip-zh | 
`recordsInputPath` 和 `recordsOutputPath` 提供对输入和输出的更精细控制, 但通常仅设置 `recordsPath` 就足够了。
:::
::: warning-zh | 
如果您更改 `webpack` 处理模块 `ID` 的方式, `webpack` 仍会考虑可能存在的 `records`! 如果要使用新的模块 `ID` 方案, 则还必须删除文件。
:::

### 与资源管道集成
要与资源管道集成, 可以考虑使用诸如 [webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin) 或 [webpack-assets-manifest](https://www.npmjs.com/package/webpack-assets-manifest) 之类的插件。这些解决方案将生成 `JSON`, 该`JSON` 将原始资源路径映射到新资源。

### 结论
该项目现在具有基本的缓存行为。如果尝试修改 `index.js` 或 `component.js`, 则供应商捆绑包应保持不变。

回顾一下:
- `Webpack` 维护一个运行时, 其中包含运行该应用程序所需的信息。
- 如果运行时清单更改, 则该更改会使包含的捆绑软件无效。
- 某些插件允许您将运行时写入生成的 `index.html` 中。也可以将信息提取到 `JSON` 文件中。`JSON` 随服务器端渲染一起派上用场。
- `Records` 使您可以跨构建存储模块 `ID`。缺点是, 您必须跟踪记录文件。

在下一章中, 您将学习分析构建, 因为它对于理解和改进构建至关重要。