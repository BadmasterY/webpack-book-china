## 服务器端渲染
**服务器端渲染**(Server Side Renderring, SSR)是一种技术, 允许使用 `HTML`, `JavaScript`, `CSS` 甚至应用程序状态来提供初始有效负载。您将提供一个完全渲染的 `HTML` 页面, 即使没有启用 `JavaScript`, 该页面也是有意义的。除了提供潜在的性能优势外, 这还可以帮助搜索引擎优化(Search Engine Optimization, SEO)。

尽管这个想法听起来并不是那么独特, 但还是有技术成本的。该方法由 `React` 推广。此后, 出现了一些封装棘手方法的框架, 如 [Next.js](https://www.npmjs.com/package/next) 和 [razzle](https://www.npmjs.com/package/razzle)。

为了演示 `SSR`, 您可以使用 `webpack` 编译客户端构建, 然后由遵循该原理的 `React` 渲染服务器获取它。这样做足以了解其工作原理以及问题从何而来。

### 使用 React 设置 Babel
["组合配置"](../Developing/composing-configuration)一章介绍了配置方法, 而["加载 JavaScript"](../Loading/javascript)一章介绍了将 `Babel` 与 `webpack` 一起使用的要点。在继续后续内容之前, 应确保已完成基本设置。

要使用 `React`, 我们需要进一步的配置。鉴于大多数 `React` 项目都依赖 `JSX` 格式, 因此您必须通过 `Babel` 启用它:
```bash
npm add @babel/preset-react --develop
```
将其与 `Babel` 配置连接如下:

**.babelrc**
```
{
  ......
  "presets": [
    "@babel/preset-react",
    ......
  ]
}
```

### 设置一个 React 演示
为了确保项目具有相关性, 请安装 `React` 和 [react-dom](https://www.npmjs.com/package/react-dom)。需要后一个程序包(`react-dom`)才能将应用程序呈现到 `DOM`。

```bash
npm add react react-dom
```

接下来, `React` 代码需要一个小的入口文件。如果您在浏览器端, 则应该将带有 `Hello world` 的 `div` 挂载到文档中。为了证明它是可行的, 单击它应该显示一个带有 `"hello"` 消息的对话框。在服务器端, `React` 组件被返回, 服务器可以获取它。

调整如下:

**src/ssr.js**
```js
const React = require("react");
const ReactDOM = require("react-dom");

const SSR = <div onClick={() => alert("hello")}>Hello world</div>;

// Render only in the browser, export otherwise
if (typeof document === "undefined") {
  module.exports = SSR;
} else {
  ReactDOM.hydrate(SSR, document.getElementById("app"));
}
```

您仍然缺少 `webpack` 配置, 无法将此文件转换为服务器可以接收的文件。

::: warning-zh | 
鉴于 `ES2015` 的导入和 `CommonJS` 的导出不能混合使用, 因此入口文件是用 `CommonJS` 样式编写的。
:::

### 配置 webpack
为了保证原有配置的整洁, 我们将定义一个单独的配置文件。许多工作已经完成。鉴于您必须使用多个环境中的相同输出, 因此使用 `UMD` 作为库目标很有意义:

**webpack.ssr.js**
```js
const path = require("path");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");

module.exports = merge([
  {
    mode: "production",
    entry: {
      index: path.join(__dirname, "src", "ssr.js"),
    },
    output: {
      path: path.join(__dirname, "static"),
      filename: "[name].js",
      libraryTarget: "umd",
      globalObject: "this",
    },
  },
  parts.loadJavaScript(),
]);
```

为了方便生成构建, 添加一个辅助脚本:

**package.json**
```json{2}
"scripts": {
  "build:ssr": "wp --config webpack.ssr.js",
  ......
},
```

如果构建 `SSR` 演示(`npm run build:ssr`), 则应该看到一个新文件 `./static/index.js`。下一步是设置服务器以呈现它。

### 设置服务器
为了让事件变得清晰明了, 可以设置一个独立的 `Express` 服务器, 可以获取生成的包并按照 `SSR` 规则进行渲染。先安装 `Express`:
```bash
npm add express --develop
```

如果需要运行生成的文件, 请按以下方式来实施服务器:

**server.js**
```js
const express = require("express");
const { renderToString } = require("react-dom/server");

const SSR = require("./static");

server(process.env.PORT || 8080);

function server(port) {
  const app = express();

  app.use(express.static("static"));
  app.get("/", (req, res) =>
    res.status(200).send(renderMarkup(renderToString(SSR)))
  );

  app.listen(port);
}

function renderMarkup(html) {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>Webpack SSR Demo</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <div id="app">${html}</div>
    <script src="./index.js"></script>
  </body>
</html>`;
}
```

立即运行服务器(`node ./server.js`), 然后在浏览器中输入 `http://localhost:8080`, 您应该会看到一些熟悉的东西:
![Hello World](../../output/hello.webp)

即使现在有一个 `React` 应用程序正在运行, 您也很难进行开发。如果您尝试修改代码, 则什么也不会发生。如["多页"](./multiple-pages)一章中所述, 可以通过在多编译器模式下运行 `webpack` 来解决该问题。另一种选择是针对当前配置以 `watch` 模式运行 `webpack` 并为服务器设置监视程序。接下来, 您将学习如何进行设置。

::: tip-zh | 
如果想调试服务器的输出, 请设置 `export DEBUG=express:application`。
:::
::: tip-zh | 
如果您按照["分离运行时"](../Optimizing/separating-runtime)一章中的描述编写清单, 则可以对 `webpack` 生成的资产的引用自动写入服务器端模板。
:::

### 监听 SSR 更改并刷新浏览器
问题的第一部分很快得到解决。在终端中运行 `npm run build:ssr -- --watch`。这迫使 `webpack` 在 `watch` 模式下运行。为了方便起见, 可以将此思想包装在 `npm` 脚本中, 但这对于本演示来说已经足够。

剩下的部分比到目前为止要困难的多。如何使服务器知道更改以及如何将更改传达给浏览器？

[browser-refresh](https://www.npmjs.com/package/browser-refresh) 可以派上用场, 因为它可以解决这两个问题。首先安装:
```bash
npm add browser-refresh --develop
```

客户端部分需要对服务器代码进行两个小的更改:

**server.js**
```js{5,7,16}
server(process.env.PORT || 8080);

function server(port) {
  ......
  // app.listen(port);

  app.listen(port, () => process.send && process.send("online"));
}

function renderMarkup(html) {
  return `<!DOCTYPE html>
<html>
  ......
  <body>
    ......
    <script src="${process.env.BROWSER_REFRESH_URL}"></script>
  </body>
</html>`;
}
```

第一个更改告诉客户端该应用程序已联机并且可以使用。后一个更改将客户端脚本附加到输出。`browser-refresh` 管理相关的环境变量。

在一个终端中运行 `node_modules/.bin/browser-refresh ./server.js`, 然后通过 `http://localhost:8080` 像以前一样打开浏览器以测试设置。同时在另一个终端上以 `watch` 模式运行 `webpack`(`npm run build:ssr`)。如果一切顺利, 对演示客户端脚本(`./src/ssr.js`)所做的任何修改都将在浏览器中显示, 或者在服务器上导致失败。

如果服务器崩溃, 则会丢失 `WebSocket` 连接。在这种情况下, 必须在浏览器中强制刷新。如果服务器也是通过 `webpack` 进行管理的, 则可以规避这个问题。

为了证明 `SSR` 是有效的, 请打开浏览器控制台。您应该可以看到一些熟悉的东西:
![SSR 输出](../../output/ssr.png)

您可以在那里看到所有相关的 `HTML`, 而不仅仅是安装应用程序的 `div`。在这种特殊情况下, 这里内容并不多, 但足以展示这种方法。

::: tip-zh | 
可以通过为服务器实现生产模式来进一步完善, 该生产模式将至少应跳过注入 `browser-refresh` 脚本的过程。服务器可以将初始数据有效载荷注入到生成的 `HTML` 中。这样做可以避免在客户端进行查询。
:::

### 开放式问题
尽管该演示说明了 `SSR` 的基本概念, 但仍然存在未解决的问题:
- 如何处理样式? `Node` 不了解与 `CSS` 相关的导入。
- 除了 `JavaScript` 以外, 该如何处理? 如果服务器端是通过 `webpack` 处理的, 那么这将不是什么大问题, 因为您可以在 `webpack` 上对其进行处理。
- 如何通过 `Node` 以外的其他服务器运行服务器? 一种选择是将 `Node` 实例包装在服务中, 然后通过主机环境运行该服务。理想情况下, 结果将被缓存, 并且您可以针对每个平台(例如 `Java` 和其他平台)找到针对此特定条件的更具体的解决方案。

诸如此类的问题是诸如 `Next.js` 或 `razzle` 之类的解决方案之所以存在的原因。它们旨在解决此类 `SSR` 特定问题。

::: tip-zh | 
路由本身是一个很大的问题, 可以通过 `Next.js` 之类的框架解决。[Patrick Hund 讨论了如何使用 React 和 React Router 4 来解决这个问题](https://ebaytech.berlin/universal-web-apps-with-react-router-4-15002bb30ccb)。
:::

::: tip-zh | 
`Webpack` 提供了 [require.resolveWeak](https://webpack.js.org/api/module-methods/#requireresolveweak) 来实现 `SSR`。这是解决方案使用的特定功能, 例如下面的 [react-universal-component](https://www.npmjs.com/package/react-universal-component)。
:::

### 预渲染
`SSR` 不是解决 `SEO` 问题的唯一解决方案。**预渲染**是一种更容易实现的替代技术。关键是使用无头浏览器呈现页面的初始 `HTML` 标记, 然后将其提供给搜索引擎。需要注意的是, 该方法不适用于高度动态的数据。`Webpack` 存在以下解决方案:
- [prerender-spa-plugin](https://www.npmjs.com/package/prerender-spa-plugin) 在内部使用 [Puppeteer](https://www.npmjs.com/package/puppeteer)。
- [prerender-loader](https://www.npmjs.com/package/prerender-loader) 与 `html-webpack-plugin` 集成在一起, 但在没有 `HTML` 文件的情况下也可以工作。加载器非常灵活, 可以进行定制以适合您的用例(即 `React` 或其他框架)。

### 结论
`SSR` 带来了技术挑战, 为此, 围绕着它出现了具体的解决方案。`Webpack` 非常适合 `SSR` 设置。

回顾一下:
- 服务器端渲染(`SSR`)可以为浏览器提供更多的初始渲染。无需等待 `JavaScript` 加载, 您可以立即显示标记。
- `SSR` 还允许您将数据的初始有效负载传递给客户端, 以避免对服务器进行不必要的查询。
- `Webpack` 可以管理与客户端部分相关的问题。如果需要更集成的解决方案, 它也可以用于生成服务器。`Next.js` 之类的抽象隐藏了这些细节。
- `SSR` 并非没有代价, 并且会导致新的问题, 因为您需要更好的方法来处理诸如样式或路由之类的问题。服务器和客户端环境在本质上有所不同, 因此必须编写代码, 以使它不会过多依赖于平台特定的功能。

在下一章中, 我们将学习微前端和 `Module Federation`。