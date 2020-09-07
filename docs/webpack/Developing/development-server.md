## 开发服务器
在不使用任何特殊工具的情况下开发前端, 通常不得不经常刷新浏览器以查看更改。鉴于此问题过于枯燥且频繁, 因此可以使用一些工具来解决此问题。

市场上最早的工具是 [LiveReload](http://livereload.com/) 和 [Browsersync](http://www.browsersync.io/)。两种方法的目的都是允许您在开发时自动刷新浏览器。它们还可以接收 `CSS` 更改并应用新样式, 而不必进行强制刷新, 因为这会丢失浏览器的状态。

可以通过 [browser-sync-webpack-plugin](https://www.npmjs.com/package/browser-sync-webpack-plugin) 将 `Browsersync` 与 `webpack` 一起使用, 但是 `webpack` 通过 <mark>watch</mark> 模式和开发服务器的形式提供了更多灵活的技巧。

### Webpack `watch` 模式
`Webpack` 实现了一种 <mark>watch</mark> 模式, 它对 `webpack` 绑定的项目文件进行操作。您可以通过将 <mark>--watch</mark> 传递到 `webpack` 来激活它。范例: <mark>npm run build -- --watch</mark>。此后, 对由 `webpack` 监听的文件进行的任何更改都会触发重建。

尽管这解决了在更改时重新编译源代码的问题, 但它在前端和浏览器更新上没有任何作用。这是需要进一步解决的地方。

### webpack-dev-server
[webpack-dev-server](https://www.npmjs.com/package/webpack-dev-server)(`WDS`) 是官方维护的 `webpack` 解决方案。`WDS` 是在内存中运行的开发服务器, 这意味着捆绑包的内容不会产出到文件中, 而是存储在内存中。在尝试调试代码和样式时, 这一区别至关重要。

如果使用 `WDS`, 则应注意以下两个相关字段:
- 如果您依赖基于 `HTML5` 历史记录 `API` 的路由, 则应配置 <mark>devServer.historyApiFallback</mark>。
- 假设您不是动态生成 `index.html`, 而是希望自己将其维护在特定目录中, 则需要将 `WDS` 指向它。`contentBase` 接受路径(例如 `"build"`)或路径数组(例如 `["build", "images"]`)。<mark>devServer.contentBase</mark> 值默认为项目根目录。
- 如果使用多个服务器, 则必须将 `WDS` 代理到它们。代理设置接受将查询映射解析到另一台服务器的代理映射(例如: `{ "/api": "http://localhost:3000/api" }`)的对象。默认情况下, <mark>devServer.proxy</mark> 禁用代理设置。
- 使用 <mark>devServer.headers</mark> 在此处将自定义标题附加到您的请求。

::: tip-zh | 
[官方文档](https://webpack.js.org/configuration/dev-server/)涵盖了更多内容。
:::
::: tip-zh | 
要与其他服务器集成, 可以通过将 <mark>devServer.writeToDisk</mark> 属性设置为 `true` 来将文件从 `WDS` 发送到文件系统。
:::
::: warning-zh | 
你应该严格使用 `WDS` 进行开发。如果您希望托管应用程序, 请考虑其他标准解决方案, 例如 `Apache` 或 `Nginx`。
:::
::: warning-zh | 
`WDS` 在命令行使用中隐式依赖于 **`webpack-cli`**。在这种情况下, 请确保两者都已安装。
:::

### webpack-plugin-serve
[webpack-plugin-serve](https://www.npmjs.com/package/webpack-plugin-serve)(`WPS`) 是一个第三方插件, 它将更新浏览器所需的逻辑封装到 `webpack` 插件中。在底层, 它依赖于 `webpack` 的 `watch` 模式, 并在此基础上构建, 同时实现**模块热更新**(`HMR`)和为 `webpack` 提供的官方解决方案中所有的其他功能。

还有一些功能超出了官方的开发服务器, 包括 `webpack` 的多编译器模式(即, 当您给它一个配置数组时)和一个状态覆盖的支持。

::: tip-zh | 
要了解有关 `HMR` 的相关信息, 请阅读[模块热更新](../Appendices/hmr.html)附录。您可以了解该技术的基础知识以及人们使用它的原因。不过, 应用它并不需要完成本教程。
:::

### WPS 入门
要开始使用 `WPS`, 请先安装它:
```bash
npm add webpack-plugin-serve --develop
```

要将 `WPS` 集成到项目中, 请定义一个 `npm` 脚本来启动它。要遵循 `npm` 约定, 请像下面 *`start`* 这样:  
**package.json**
```json{3}
{
  "scripts": {
    "start": "wp --mode development",
    "build": "wp --mode production"
  },
  ......
}
```
此外, `WPS` 必须添加到 `webpack` 配置。在本例中, 我们将在 `liveReload` 模式下运行它, 并在更改时刷新浏览器。此外, 我们还可以将 `PORT` 传递给 `process`(即 `PORT=3000 npm start`):

**webpack.config.js**
```js
const { mode } = require("webpack-nano/argv");
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");

module.exports = {
  watch: mode === "development",
  entry: ["./src", "webpack-plugin-serve/client"],
  mode,
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title: "Webpack demo",
      },
    }),
    new WebpackPluginServe({
      port: process.env.PORT || 8080,
      static: "./dist",
      liveReload: true,
      waitForBuild: true,
    }),
  ],
};
```
如果执行 `npm run start` 或立即执行 `npm start`, 则应在终端中看到以下内容:
```bash
$ npm start

⬡ webpack: Watching Files
⬡ wps: Server Listening on: http://[::]:8080

⬡ webpack: Hash: 36256b125ac52870571f
  Version: webpack 5.0.0-beta.29
  Time: 373 ms
  Built at: 2020-09-07 16:09:41
  asset index.html 198 bytes [emitted]
  asset main.js 71.8 KiB [emitted] (name: main)
  Entrypoint main = main.js
  ./src/index.js 77 bytes [built]
  ./node_modules/webpack-plugin-serve/client.js 1.05 KiB [built]
  ./src/component.js 146 bytes [built]
  ./node_modules/webpack-plugin-serve/lib/client/client.js 3.32 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/log.js 756 bytes [built]
  ./node_modules/webpack-plugin-serve/lib/client/ClientSocket.js 2.27 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/hmr.js 1.69 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/overlays/progress-minimal.js 2.38 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/overlays/progress.js 3.88 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/overlays/status.js 8.27 KiB [built]
  ./node_modules/webpack-plugin-serve/lib/client/overlays/util.js 1.17 KiB [built]
      + 10 hidden modules 

⬡ webpack: ⁿᵃⁿᵒ Duplicate build detected (36256b125ac52870571f)
```
> 译者注: `webpack 4` 输出信息与这里略有出入。

服务器正在运行, 并且如果在浏览器中打开 `http://localhost:8080/`, 则应会显示一个熟悉的问候:
![Hello world!](../../start/start_1.png)

如果尝试修改代码, 则应该在终端中看到输出。浏览器还应该执行强制刷新, 以便您可以看到更改。
::: tip-zh | 
[dotenv](https://www.npmjs.com/package/dotenv) 允许您通过 *`.env`* 文件定义环境变量。`dotenv` 允许您快速设置主机和端口。
:::
::: tip-zh | 
如果使用基于 `HTML5` 历史 `API` 的路由, 请启用 <mark>historyFallback</mark>。
:::
::: tip-zh | 
如果你想要更好的输出, 可以考虑 [error-overlay-webpack-plugin](https://www.npmjs.com/package/error-overlay-webpack-plugin), 因为它能更好地显示错误在哪里产生的。
:::

### 从网络访问开发服务器
可以通过配置环境(即, 在 `Unix` 中使用 <mark>export PORT=3000</mark> 或在 `Windows` 上使用 <mark>SET PORT=3000</mark>)自定义主机和端口。在大多数平台上, 默认设置就足够了。

要访问服务器, 您需要确定计算机的 `IP`。在 `Unix` 上, 可以使用实现 <mark>ifconfig | grep inet</mark>。在 `Windows` 上可以使用 <mark>ipconfig</mark>。也可以使用 `npm` 软件包, 例如 [node-ip](https://www.npmjs.com/package/node-ip) 也许会派上用场。特别是在 `Windows` 上, 您需要设置您的 <mark>HOST</mark> 来匹配您的 `IP` 地址, 使之可以访问。

### 加快配置开发速度
更改需要打包的文件时, `WPS` 将处理重启服务器的操作。但是, 它忽略了对 `webpack` 配置所做的更改, 并且每当发生更改时, 您都必须手动重启 `WPS` 。如 [GitHub 中所述](https://github.com/webpack/webpack-dev-server/issues/440#issuecomment-205757892), 可以使用 [nodemon](https://www.npmjs.com/package/nodemon) 监视工具来自动化该过程。

要使其正常工作, 您必须先通过 <mark>npm add nodemon --develop</mark> 安装它。如果您想尝试一下, 请看以下脚本:

**package.json**
```json{2}
"scripts": {
  "start": "nodemon --watch webpack.* --exec \"wp --mode development\"",
  "build": "wp --mode production"
},
```

### 轮询而不是监视文件
`webpack` 随附的文件监视配置可能无法在您的系统上使用。在较旧版本的 `Windows` 和 `Ubuntu` 上可能会出现问题。

当使用 `Vagrant`, `Docker` 或任何其他解决方案时, 轮询几乎是强制性的, 这些解决方案不转发与运行 `webpack` 的虚拟机共享的文件夹中的文件的更改事件。[vagrant-notify-forwarder](https://github.com/mhallin/vagrant-notify-forwarder) 解决了 `MacOS` 和 `Unix` 的问题。

在任何情况下, 启用轮询都是一个不错的选择:

**webpack.config.js**
```js
module.exports = {
  watchOptions: {
    // Delay the rebuild after the first change
    aggregateTimeout: 300,

    // Poll using interval (in ms, accepts boolean too)
    poll: 1000,
    // Ignore node_modules to decrease CPU usage
    ignored: /node_modules/,
  },
};
```
该设置比默认设置耗费更多资源, 但是如果默认设置不适合您, 则值得尝试一下。

### 使用中间件与服务器集成
考虑到您的前端可能与后端紧密耦合, 存在多个服务器中间件以简化集成:
- [webpack-dev-middleware](https://www.npmjs.com/package/webpack-dev-middleware)
- [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware)
- [webpack-isomorphic-dev-middleware](https://www.npmjs.com/package/webpack-isomorphic-dev-middleware)
- [koa-webpack](https://www.npmjs.com/package/koa-webpack)

如果您想要更多的控制和灵活性, 那么还可以使用 [Node API](https://webpack.js.org/configuration/dev-server/)。

### 监视 webpack 模块图之外的文件
您的项目可能间接依赖于某些文件, 而 `webpack` 对此并不了解。为了解决该问题, 我实现了一个名为 [webpack-add-dependency-plugin](https://www.npmjs.com/package/webpack-add-dependency-plugin) 的小插件, 可让您处理该问题。

例如, 当您使用 `MiniHtmlWebpackPlugin` 并自定义其模板逻辑来加载外部文件时, 可能需要解决此情况。

### 开发插件
`Webpack` 插件生态系统是多种多样的, 并且有很多插件可以专门帮助开发:
- 在混合环境中进行开发时, [case-sensitive-paths-webpack-plugin](https://www.npmjs.com/package/case-sensitive-paths-webpack-plugin) 会很方便。例如, `Windows`, `Linux` 和 `MacOS` 在路径命名方面有所不同。
- [npm-install-webpack-plugin](https://www.npmjs.com/package/npm-install-webpack-plugin) 允许 `webpack` 在您将新软件包 `import` 到项目时, 安装并将已安装的包与 `package.json` 连接。
- [react-dev-utils](https://www.npmjs.com/package/react-dev-utils) 包含为 [Create React App](https://www.npmjs.com/package/create-react-app) 开发的 `webpack` 实用程序。尽管是如此命名的, 但可以在 `React` 之外使用。如果只需要格式化 `webpack` 消息, 请考虑使用 [webpack-format-messages](https://www.npmjs.com/package/webpack-format-messages)。
- [webpack-notifier](https://www.npmjs.com/package/webpack-notifier) 使用系统通知来通知您 `webpack` 的状态。
- [sounds-webpack-plugin](https://www.npmjs.com/package/sounds-webpack-plugin) 会在发生故障时响铃, 而​​不是让 `webpack` 静默失败。

> 译者注: `npm-install-webpack-plugn`, 个人感觉上一版本的原意更为清晰一些, 上一版本翻译为: 通过使用 `webpack` 自动安装和保存依赖关系加快开发速度。在调用 **`require`** 或 **`import`** 时, 将自动安装和保存丢失的依赖项。

### 结论
`WPS` 和 `WDS` 通过提供面向开发的功能来补充 `webpack`, 并使其对开发人员更加友好。

回顾一下:
- `Webpack` 的 <mark>watch</mark> 模式是朝着更好的开发体验迈出的第一步。编辑源代码时, 可以使用 `webpack` 编译捆绑包。
- `WPS` 和 `WDS` 可以在更改时刷新浏览器, 同时实现了 **`HMR`**。
- `Webpack` 中默认的 `watch` 设置可能在某些系统上出问题, 因此更消耗资源的轮询是一种选择。
- 可以使用中间件将 `WDS` 集成到 `Node` 服务器中, 这样做可以提供更多的可控性。
- `WPS` 和 `WDS` 的作用远远不止刷新和 `HMR`。例如, 代理配置允许您将其连接到其他服务器。

在下一章中, 您将学习如何组合配置, 以便可以在本书的后面进一步开发它。