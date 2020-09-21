## 代码拆分
随着功能的不断添加, `Web` 应用程序往往会变得很大。您的网站加载时间越长, 对用户的困扰就越大。在连接速度很慢的移动环境中, 此问题会更加严重。

即使拆分捆绑包可以帮助解决问题, 但它并不是唯一的解决方案, 您仍然可能不得不下载大量数据。幸运的是, 由于代码拆分允许在需要时延迟加载代码, 所以可以做得更好。

当用户进入应用程序的新视图时, 您可以加载更多代码。您还可以将加载绑定到特定的操作, 例如滚动或单击按钮。您还可以尝试预测用户下一步要做什么, 并根据您的猜测加载代码。这样, 当用户尝试访问该功能时, 该功能将已经存在。
::: tip-zh | 
顺便说一句, 可以使用 `webpack` 的延迟加载来实现 `Google` 的 [PRPL 模式](https://developers.google.com/web/fundamentals/performance/prpl-pattern/)。`PRPL`(推送, 渲染, 预缓存, 延迟加载)在设计时考虑了移动网络。
:::
::: tip-zh | 
Philip Walton 的[闲置到紧急技术](https://philipwalton.com/articles/idle-until-urgent/)补充了代码拆分, 使您可以进一步优化应用程序加载性能。这个想法是将工作推迟到将来, 直到其有意义为止。
:::

### 代码拆分格式
可以在 `webpack` 中以两种主要方式完成代码拆分: 通过动态 `import` 或 `require.ensure` 语法。前者用于本书项目, `require.ensure` 被认为是旧式语法。

目标是最终得到一个按需加载的拆分点。拆分中可以包含其他拆分点, 并且您可以基于拆分来构建整个应用程序。这样做的好处是, 网站的初始负载可以小于其他情况。

![代码拆分](../../Build/code_splite.png)

#### 动态 import
动态 `import` 定义为 `Promise`:
```js
import(/* webpackChunkName: "optional-name" */ "./module").then(
  module => {......}
).catch(
  error => {......}
);
```
`Webpack` 通过注释提供了额外的控制。在该示例中, 我们重命名了结果块。给多个块指定相同的名称会将它们分组到相同的捆绑包中。此外 `webpackMode`, `webpackPrefetch` 和 `webpackPreload` 都是很棒的选择, 因为它们可以让您定义何时触发导入以及浏览器应如何处理。

`Mode` 可让您定义 `import()` 上的操作。在可用的选项中, `weak` 适用于服务器端渲染(`SSR`), 因为使用它意味着 `Promise` 将返回 `reject`, 除非以其他方式加载模块。在 `SSR` 的情况下, 这将是理想的。

`Prefetch` 告诉浏览器将来需要的资源, 而 `preload` 意味着浏览器将需要当前页中的资源。根据这些提示, 浏览器可以有选择地合理加载数据。[Webpack 文档更详细地解释了可用选项](https://webpack.js.org/api/module-methods/#magic-comments)。
::: tip-zh | 
[webpack.PrefetchPlugin](https://webpack.js.org/plugins/prefetch-plugin/) 允许您在任何模块级别上使用 `prefetch`。
:::
::: tip-zh | 
如果您想让 `webpack` 自定义名称或名称中的一部分, `webpackChunkName` 接受 `[index]` 和 `[request]` 占位符。
:::

该接口允许组合, 您可以并行加载多个资源:
```js
Promise.all([import("lunr"), import("../search_index.json")]).then(
  ([lunr, search]) => {
    return {
      index: lunr.Index.load(search.index),
      lines: search.lines,
    };
  }
);
```

上面的代码为每个请求创建单独的捆绑包。如果只需要一个捆绑包, 则必须使用命名或定义中间模块为 `import`。

::: warning-zh | 
正确配置语法后, 该语法仅适用于 `JavaScript`。如果使用其他环境, 则可能必须使用以下各节中介绍的替代方法
:::

### 使用动态 import 定义拆分点
这个想法可以通过设置一个包含字符串的模块来演示, 该字符串将替换演示按钮的文本:

**src/lazy.js**
```js
export default "Hello from lazy";
```

您还需要将应用程序指向这个文件, 这样应用程序就知道通过绑定加载过程来加载它。每当用户碰巧单击按钮时, 都会触发加载过程并替换内容:

**src/component.js**
```js
export default (text = "Hello world") => {
  const element = document.createElement("div");

  element.className = "rounded bg-red-100 border max-w-md m-4 p-4";
  element.innerHTML = text;
  element.onclick = () =>
    import("./lazy")
      .then((lazy) => {
        element.textContent = lazy.default;
      })
      .catch((err) => {
        console.error(err);
      });

  return element;
};
```

如果运行应用程序(<mark>npm start</mark>)并单击按钮, 您应该会看到其中的新文本。

在执行 `npm run build` 之后, 您应该看到:
```bash{6}
⬡ webpack: Build Finished
⬡ webpack: Hash: e35c7871cc57e0010587
  Version: webpack 5.0.0-beta.29
  Time: 14722 ms
  Built at: 2020-09-21 14:31:19
  asset 34.js 196 bytes [emitted] [minimized] 1 related asset
  asset index.html 237 bytes [emitted]
  asset logo.jpg 515 KiB [emitted] [big] (auxiliary name: main)
  asset main.css 8.31 KiB [emitted] (name: main) 1 related asset
  asset main.js 16.8 KiB [emitted] [minimized] (name: main) 1 related asset
  Entrypoint main = main.css main.js (logo.jpg main.css.map main.js.map)
  ......
```
这 `34.js` 就是您的分割点。检查文件后发现 `webpack` 已将代码包装在一个 `webpackJsonp` 块中并处理了代码位。

::: tip-zh | 
如果要调整块的名称, 请设置 `output.chunkFilename`。例如, 将其设置为 `"chunk.[id].js"` 将在每个拆分的块之前加上单词 "chunk"。
:::
::: tip-zh | 
[bundle-loader](https://www.npmjs.com/package/bundle-loader) 给出了类似的结果, 但是通过 `loader` 接口。它支持通过其 `name` 选项给捆绑软件命名。
:::
::: warning-zh | 
如果使用的是 `TypeScript`, 请确保将 `compilerOptions.module` 设置为 `esnext` 或 `es2020`, 以便代码拆分正常工作。
:::

### 在运行时控制代码拆分
特别是在具有第三方依赖项和高级部署设置的复杂环境中, 您可能希望控制从何处加载拆分代码。[webpack-require-from](https://www.npmjs.com/package/webpack-require-from) 旨在解决该问题, 并且能够重写导入路径。

### React 中的代码拆分
有一些特定于 `React` 的解决方案, 包装在一个小的 `npm` 软件包后面:

- [@loadable/component](https://www.npmjs.com/package/@loadable/component) 将模式包装在 `createAsyncComponent` 调用中, 并提供服务器端渲染的特定功能。
- [react-imported-component](https://www.npmjs.com/package/react-imported-component) 是另一个基于钩子的全功能解决方案。
- 请参阅 [React 官方文档](https://reactjs.org/docs/code-splitting.html)以了解开箱即用中包含的代码拆分 `API`。最重要的是 `React.lazy` 和 `React.Suspense`。当前, 这些功能不支持服务器端渲染。

### 禁用代码拆分
尽管默认情况下, 代码拆分是一种好习惯, 但并非总是正确的, 尤其是在服务器端使用时。因此, 可以使用如下方式禁用:
```js
const config = {
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};
```
::: tip-zh | 
请参阅 [Glenn Reyes 的详细说明](https://medium.com/@glennreyes/how-to-disable-code-splitting-in-webpack-1c0b1754a3c5)。
:::

### 机器学习驱动的 prefetch
用户通常以特定方式使用应用程序。这一事实意味着, 即使在用户访问应用程序的特定部分之前, 仍然有必要加载它们。[guess-webpack](https://www.npmjs.com/package/guess-webpack) 是基于预测的预加载思想的插件。[Minko Gechev 在他的文章中详细解释了该方法](https://blog.mgechev.com/2018/03/18/machine-learning-data-driven-bundling-webpack-javascript-markov-chain-angular-react/)。

### 结论
代码拆分是一项功能, 可让您进一步提高应用程序的性能。您可以在需要时加载代码, 以加快初始加载时间并改善用户体验, 尤其是在带宽受限的移动环境中。

回顾一下:
- **代码拆分**需要进行额外的配置, 因为您必须决定拆分哪些内容以及在何处进行拆分。通常, 您会在路由器中找到良好的拆分点。或者您注意到只有在使用特定功能时才需要特定功能。
- 使用命名将单独的拆分点拉入相同的捆绑包中。
- 这些技术可以在像 `React` 这样的现代框架和库中使用。您可以将相关逻辑包装到特定组件中。
- 要禁用代码拆分, 使用 `webpack.optimize.LimitChunkCountPlugin` 并将 `maxChunks` 设置为 `1`。

在下一章中, 您将学习如何在不通过 `webpack` 配置的情况下拆分供应商捆绑包。