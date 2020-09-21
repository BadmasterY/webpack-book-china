## 捆绑拆分
目前, 应用程序的生产版本是单个 `JavaScript` 文件。如果更改了应用程序, 则客户端也必须下载供应商依赖项。

最好只下载更改的部分。如果供应商依赖关系发生变化, 则客户端应仅获取供应商依赖。实际的应用程序代码也是如此。可以使用 `optimization.splitChunks.cacheGroups` 进行拆分。在生产模式下运行时, webpack 4 可以执行一系列开箱即用的拆分, 但是在这种情况下, 我们将手动执行一些操作。

::: tip-zh | 
要正确地使捆绑包失效, 您必须将 `hash` 附加到生成的捆绑包名称中, 如["在文件名中添加哈希"]()一章中所述。
:::

### 捆绑拆分的想法
通过捆绑拆分, 您可以将供应商依赖项推到单独的捆绑包中, 并从客户端的缓存中受益。该过程可以以这样的方式完成, 即应用程序的整体大小保持不变。鉴于有更多的请求要执行, 因此会有一些开销。但是缓存的好处弥补了这一成本。

举一个简单的例子, 您可以使用 `main.js`(10 kB)和 `vendor.js`(`90 kB`)代替 `main.js`(100 kB)。现在, 对应用程序所做的更改对于之前已经使用过该应用程序的客户端来说是方便的。

缓存会带来一些问题。其中之一是缓存失效。在["在文件名中添加哈希"]()一章中讨论了与此相关的方法。

### 添加要拆分的内容
鉴于没有太多要拆分成供应商捆绑包的内容, 因此应该在其中添加一些内容。首先将 `React` 添加到项目中:
```bash
npm add react react-dom
```

然后在项目中引入它:

**src/index.js**
```js{1-2}
import "react";
import "react-dom";
......
```

执行 `npm run build` 以获取构建信息。您应该得到如下结果:
```bash{10}
⬡ webpack: Build Finished
⬡ webpack: Hash: 3f24c6bfc9877b8a0352
  Version: webpack 5.0.0-beta.29
  Time: 12312 ms
  Built at: 2020-09-21 15:47:17
  asset 34.js 196 bytes [compared for emit] [minimized] 1 related asset
  asset index.html 237 bytes [compared for emit]
  asset logo.jpg 515 KiB [compared for emit] [big] (auxiliary name: main)
  asset main.css 8.31 KiB [compared for emit] (name: main) 1 related asset
  asset main.js 140 KiB [emitted] [minimized] (name: main) 2 related assets
  Entrypoint main = main.css main.js (logo.jpg main.css.map main.js.map)
```

如您所见, `main.js` 很大。接下来要进行拆分。

### 设置供应商捆绑包
在 `webpack 4` 之前, 曾经有过 `CommonsChunkPlugin` 用于管理捆绑包拆分的方法。该插件已被自动化和配置取代。要从 `node_modules` 目录中提取供应商捆绑包, 请如下调整代码:

**webpack.config.js**
```js{3-9}
const productionConfig = merge([
  ......
  {
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
  },
]);
```

如果您尝试构建项目(`npm run build`), 则应该看到以下内容:
```bash{7,11}
⬡ webpack: Build Finished
⬡ webpack: Hash: 369d33eda70b3ff397f2
  Version: webpack 5.0.0-beta.29
  Time: 11060 ms
  Built at: 2020-09-21 15:51:40
  asset 34.js 196 bytes [compared for emit] [minimized] 1 related asset
  asset 728.js 138 KiB [emitted] [minimized] (id hint: vendors) 2 related assets
  asset index.html 267 bytes [emitted]
  asset logo.jpg 515 KiB [compared for emit] [big] (auxiliary name: main)
  asset main.css 8.31 KiB [compared for emit] (name: main) 1 related asset
  asset main.js 2.89 KiB [emitted] [minimized] (name: main) 1 related asset
  Entrypoint main = 728.js main.css main.js (728.js.map logo.jpg main.css.map main.js.map)
  ......
```

现在捆绑包看起来像他们应有的样子。下图说明了当前的情况:
![应用配置后的主要捆绑包和供应商捆绑包](../../build/bundle_splite.webp)

::: tip-zh | 
`chunks: "initial"` 在这个例子中会得到相同的结果。您可以看到["代码拆分"](./code-splitting.html)后的区别, 因为all选项能够提取共同点, 即使是已经被代码分割的块, 而initial并没有做到这一点。
:::

### 控制捆绑包拆分
上面的配置可以通过对 `node_modules` 的显式 `test` 重写, 如下所示:

**webpack.config.js**
```js{3-15}
const productionConfig = merge([
  ......
  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
    },
  },
]);
```

如果您不喜欢依赖自动化, 那么遵循这种格式可以让您更好地控制拆分过程。

### 拆分和合并块
`Webpack` 通过两个插件提供了对生成块的更多控制:
- `AggressiveSplittingPlugin` 允许您产出更多和更小的捆绑包。由于新标准的工作方式, 此行为在 `HTTP/2` 中很方便。
- `AggressiveMergingPlugin` 正好相反。

这是主动拆分的基本思想:
```js
const config = {
  plugins: [
    new webpack.optimize.AggressiveSplittingPlugin({
        minSize: 10000,
        maxSize: 30000,
    }),
  ],
},
```

如果拆分成多个小的捆绑包, 那么无法很好的在缓存中受益。在 `HTTP/1` 环境中, 您还将造成额外的请求开销。

`AggressiveMergingPlugin` 的工作方式与此相反, 它允许您将小的捆绑包组合成更大的捆绑包:
```js
const config = {
  plugins: [
    new AggressiveMergingPlugin({
        minSizeReduce: 2,
        moveToParents: true,
    }),
  ],
},
```
如果使用 `webpack` `records`, 这些插件可以获得良好的缓存行为。在["在文件名中添加哈希"]()一章中详细讨论了这个想法。

`webpack.optimize` 包含 `LimitChunkCountPlugin` 和 `MinChunkSizePlugin` 可进一步控制块大小。

::: tip-zh | 
Tobias Koppers 在 [webpack 的官方博客中详细讨论了积极合并(`aggressive merging`)](https://medium.com/webpack/webpack-http-2-7083ec3f3ce6)。
:::

### webpack 中的块类型
在上面的示例中, 您使用了不同类型的 `webpack` 块。`Webpack` 处理三种类型的块:
- 入口块: 入口块包含 `webpack` 运行时和随后加载的模块。
- 普通块: 普通块**不包含** `webpack` 运行时。而是可以在应用程序运行时动态加载它们。为此会生成一个合适的包装器(例如 `JSONP`)。
- 初始块: 初始块是计入应用程序的初始加载时间的普通块。作为用户, 您不必关心这些。重要的是入口块和普通块之间的划分。

### 入口配置中的捆绑包拆分
从 `webpack 5` 开始, 可以使用入口配置定义捆绑包拆分:
```js
const config = {
  entry: {
    app: {
      import: path.join(__dirname, "src", "index.js"),
      dependOn: "vendor",
    },
    vendor: ["react", "react-dom"],
  },
};
```
如果使用此配置, 则可以删除 `optimization.splitChunks` 并且输出应该仍然相同。

::: warning-zh | 
要使用 `webpack-plugin-server` 的方法, 在这种情况下, 您必须在 `webpack-plugin-serve/client` 中注入 `app.import`。这样做需要在 `AdccTytotoAL` 中进行额外的检查。该功能在["多页"]()一章中介绍。
:::

::: tip-zh | 
[webpack-cascade-optimizer-plugin](https://www.npmjs.com/package/webpack-cascade-optimizer-plugin) 提供了一种以智能顺序在输出文件中分配代码的方法。该插件使您无需拆分即可获得捆绑包拆分的效果。
:::

### 结论
现在的情况比以前好多了。请注意 `main` 捆绑包与供应商捆绑包相比有多小。为了从这种分割中获益, 您可以在本书的下一部分["在文件名中添加哈希"]()一章中设置缓存。

回顾一下:
- `Webpack` 允许您通过 `optimization.splitChunks.cacheGroups` 字段从配置中拆分捆绑包。默认情况下, 它还会在生产模式下执行捆绑包拆分。
- 供应商捆绑包包含您的项目的第三方代码。可以通过检查模块的导入位置来检测供应商依赖性。
- `Webpack` 通过特定的插件, 如 `AggressiveSplittingPlugin` 和 `AggressiveMergingPlugin` 提供了对拆分块的更多控制。主要是在面向 `HTTP/2` 的配置中m 拆分插件非常方便。
- 在内部, `webpack` 依赖于三种块类型: `entry`、`normal` 和 `initial` 块。

在下一章中, 您将学习如何整理构建。