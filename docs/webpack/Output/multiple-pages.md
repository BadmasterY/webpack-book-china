## 多页
即使 `webpack` 通常用于打包单页应用, 也可以将其用于多个单独的页面。这个想法类似于您在["Targets"](./targets)一章中生成许多​​输出文件的方式。通过 `MiniHtmlWebpackPlugin` 的一些配置即可实现。

::: tip-zh | 
如果要将目录树映射为网站, 请参见 [directory-tree-webpack-plugin](https://www.npmjs.com/package/directory-tree-webpack-plugin)。
:::

### 可能的方法
使用 `webpack` 生成多个页面时, 有几种可能:
- 经过*多编译器模式*并返回一系列配置。只要页面是独立的, 该方法就行得通, 并且几乎不需要在页面之间共享代码。这种方法的好处是您可以通过 [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) 处理它, 以提高构建性能。
- 设置单个配置并提取通用性。您执行此操作的方式可能会有所不同, 具体取决于您如何对其进行拆分。
- 如果您遵循[渐进式Web应用程序](https://developers.google.com/web/progressive-web-apps/)(`PWA`)的思想, 那么您可以使用 `AppShell` 或 `PageShell`, 并在应用程序使用时动态加载部分应用程序。

在实践中, 有更多的可能性。例如, 您必须为页面生成 `i18n` 变体。这些想法都是在基本方法之上发展起来的。

### 生成多个页面
要生成多个单独的页面, 它们应该以某种形式进行初始化。还应该能够为每个页面返回一个配置, 以便 `webpack` 选取并通过多编译器模式处理它们。

#### 抽象页面
要初始化页面, 它至少应接收页面标题, 输出路径和可选模板。每个页面应收到一个可选的输出路径和一个自定义模板。可以将该构想建模为配置部分, 并用该构想替换以前的可能实现:

**webpack.parts.js**
```js
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");

exports.page = ({
  path = "",
  template,
  title,
  entry,
  chunks,
  mode,
} = {}) => ({
  entry:
    mode === "development"
      ? addEntryToAll(entry, "webpack-plugin-serve/client")
      : entry,
  plugins: [
    new MiniHtmlWebpackPlugin({
      chunks,
      filename: `${path && path + "/"}index.html`,
      context: {
        title,
      },
      template,
    }),
  ],
});

function addEntryToAll(entries, entry) {
  const ret = {};

  Object.keys(entries).forEach((key) => {
    const e = entries[key];

    ret[key] = (Array.isArray(e) ? e : [e]).concat(entry);
  });

  return ret;
}
```

::: tip-zh | 
该 `chunks` 和 `entry` 字段将在本章后面, 以控制该脚本获取与页面相关中使用。
:::

#### 集成到配置
要将想法整合到配置中, 必须改变其组成方式。另外, 页面定义是必需的。首先, 让我们现在为每个页面重用相同的 `JavaScript` 逻辑:

**webpack.config.js**
```js{2-5,11-28}
const commonConfig = merge([
//   {
//     entry: ["./src"],
//   }
//   parts.page({ title: "Webpack demo" }),
  ......
]);

......

const getConfig = mode => {
  const pages = [
    parts.page({ title: "Webpack demo", entry: "./src", mode }),
    parts.page({ title: "Another demo", entry: "./src", path: 'another', mode }),
  ];
  let config;
  switch (mode) {
    case "production":
      config = productionConfig;
    case "development":
    default:
      config = developmentConfig;
  }

  return pages.map(page =>
    merge(commonConfig, config, page, { mode })
  );
};

module.exports = getConfig(mode);
```

进行此更改之后, 您应该在应用程序中有两个页面: `/`和 `/another`。应该可以导航到两者, 同时看到相同的输出。

::: tip-zh | 
您可以添加针对该模式的检查并抛出错误, 以防无法捕获该错误。
:::

#### 每页注入不同的脚本
问题是如何在每个页面上注入不同的脚本。在当前配置中, `entry` 两者共享相同的内容。要解决此问题, 应将 `entry` 配置移至较低级别并按页面进行管理。要使用脚本进行测试, 请设置另一个入口点:

**src/another.js**
```js
import "./main.css";
import component from "./component";

const demoComponent = component("Another");

document.body.appendChild(demoComponent);
```

该文件可以转到其自己的目录。在这里, 现有代码被重用以显示某些内容。

`Webpack` 配置必须仍然指向此文件:

**webpack.config.js**
```js{2-8,15-17,19-35}
const commonConfig = merge([
  {
    output: {
      // Needed for code splitting to work in nested paths
      publicPath: "/",
      filename: "[name].[contenthash:4].js",
    },
  },
  ......
]);
......

const getConfig = (mode) => {

//   const pages = [
//     parts.page({ title: "Webpack demo", entry: "./src", mode }),
//   ];

  const pages = [
    parts.page({
      title: "Webpack demo",
      entry: {
        app: path.join(__dirname, "src", "index.js"),
      },
      mode,
    }),
    parts.page({
      title: "Another demo",
      path: "another",
      entry: {
        app: path.join(__dirname, "src", "another.js"),
      },
      mode,
    }),
  ];

  let config;
  switch (mode) {
    case "production":
      config = productionConfig;
    case "development":
    default:
      config = developmentConfig;
  };

  return pages.map(page =>
    merge(commonConfig, config, page, { mode })
  );
};
```

这些更改之后, `/another` 应显示一些熟悉的内容:
![出现另一页](../../output/another.png)

#### 利弊
如果您构建应用程序(`npm run build`), 则应该找到 `another/index.html`。根据生成的代码, 您可以进行以下观察:
- 很清楚如何在设置中添加更多页面。
- 生成的资源直接位于生成的根目录下。这些页面是一个例外, 因为这些页面是由 `HtmlWebpackPlugin` 处理的, 但它们仍然指向根目录下的资源。可以以 `webpack.page.js` 的形式添加更多的抽象, 并通过公开接受页面配置的函数来管理路径。
- 每一页的 `Records` 应该单独写在它们自己的文件中。当前只会写入最后的配置。上面的解决方案也适用于这个问题。
- 像 `linting` 和 `clean` 这样的进程现在运行两次。在 `Targets` 中讨论了这个问题的潜在解决方案。

可以通过放弃多编译器模式将方法推向另一个方向。即使处理这种构建的速度较慢, 它也可以实现代码共享和 `shell` 的实现。进行 `shell` 设置的第一步是重新编写配置, 以使它获取页面之间共享的代码。

### 共享代码时生成多个页面
由于使用模式的原因, 当前的配置共享代码。 只有一小部分代码是不同, 页面 `manifest`、映射到它们入口的包有所不同。

在更复杂的应用程序中, 应该在整个页面中应用["捆绑拆分"](../Building/bundle-splitting)一节中涵盖的技术。那么放弃多编译器模式可能是值得的。

#### 调整配置
需要调整以在页面之间共享代码。大多数代码可以保持不变。将其公开给 `webpack` 的方式必须更改, 以便它接收单个配置对象。由于 `mini-html-webpack-plugin` 默认拾取所有 `chunk`, 因此您必须对其进行调整以仅拾取与每个页面相关的 `chunk`。

**webpack.config.js**
```js{10,16,19,31-33,35}
......
const getConfig = (mode) => {
  const pages = [
    parts.page({
      title: "Webpack demo",
      entry: {
        app: path.join(__dirname, "src", "index.js"),
      },
      mode,
      chunks: ["app", "runtime", "vendor"],
    }),
    parts.page({
      title: "Another demo",
      path: "another",
      entry: {
        another: path.join(__dirname, "src", "another.js"),
      },
      mode,
      chunks: ["another", "runtime", "vendor"],
    }),
  ];
  let config;
  switch (mode) {
    case "production":
      config = productionConfig;
    case "development":
    default:
      config = developmentConfig;
  };

//   return pages.map(page =>
//     merge(commonConfig, config, page, { mode })
//   );

  return merge([commonConfig, config, { mode }].concat(pages));
};
```

如果您生成一个构建(`npm run build`), 您应该注意到与第一个多页构建相比有些不同。没有两个 `manifest` 文件, 只有一个。由于新的配置, `manifest` 包含对生成的所有 `bundle` 的引用。

反过来, 特定于入口的文件指向 `manifest` 的不同部分, `manifest` 根据入口运行不同的代码。因此, 不需要多个单独的 `manifest`。

::: warning-zh | 
如果不调整 `webpack-plugin-serve` 的设置方式, 该设置将无法在开发模式下运行。为了使其正常工作, 您需要将其作为服务器运行, 然后将其附加到每个配置中。请参阅文档中的[完整示例](https://github.com/shellscape/webpack-plugin-serve/blob/master/test/fixtures/multi/webpack.config.js)以了解如何执行此操作。
:::

#### 利弊
与以前的方法相比, 有一些收获, 也有一些损失:
- 鉴于配置不再使用多编译器形式, 处理可能会变慢。
- 像 `CleanWebpackPlugin` 这样的插件现在没有额外的配置就无法工作了。
- 只剩下一个 `manifest`, 而不是多个。不过, 结果并不是问题, 因为入口根据其设置的不同使用它。

### 渐进式 Web 应用程序
如果通过将其与代码拆分和智能路由相结合来进一步推动该想法, 最终将得到渐进式 `Web` 应用程序(`PWA`)的想法。[webpack-pwa](https://github.com/webpack/webpack-pwa) 示例说明了如何通过 `AppShell` 或 `PageShell` 使用 `webpack` 来实现该方法。

`AppShell` 是最初被加载的, 它管理整个应用程序, 包括其路由。`PageShell` 更加精细, 并且在使用该应用程序时会加载更多的 `shell`。在这种情况下, 应用程序的总大小较大。相反, 您可以更快地加载初始内容。

`PWA` 可以与 [offline-plugin](https://www.npmjs.com/package/offline-plugin) 和 [sw-precache-webpack-plugin](https://www.npmjs.com/package/sw-precache-webpack-plugin) 之类的插件很好地结合在一起。使用 [Service Workers](https://developer.mozilla.org/en/docs/Web/API/Service_Worker_API) 可以改善离线体验。

特别是 [Workbox](https://developers.google.com/web/tools/workbox/) 及其关联的 [workbox-webpack-plugin](https://www.npmjs.com/package/workbox-webpack-plugin) 对于以最小的配置来设置 `Service Worker` 很有用。另请参阅 [service-worker-loader](https://www.npmjs.com/package/service-worker-loader) 和 [app-manifest-loader](https://www.npmjs.com/package/app-manifest-loader)。

::: tip-zh | 
[Twitter](https://developers.google.com/web/showcase/2017/twitter) 和 [Tinder](https://medium.com/@addyosmani/a-tinder-progressive-web-app-performance-case-study-78919d98ece0) 的案例研究说明了 `PWA` 方法如何改善平台。
:::

::: tip-zh | 
[HNPWA](https://hnpwa.com/) 提供了以不同 `PWA` 方法编写的 `Hacker News` 阅读器应用程序的实现。
:::

### 结论
`Webpack` 允许您管理多个页面配置。`PWA` 方法允许在使用时加载应用程序, 而 `webpack` 可以实现它。

回顾一下:
- `Webpack` 可以通过其多编译器模式或将所有页面配置都包含到一个页面中来生成单独的页面。
- 多编译器配置可以使用外部解决方案并行运行, 但是很难应用诸如捆绑拆分之类的技术。
- 多页设置可以创建渐进式 `Web` 应用程序。在这种情况下, 您可以使用各种 `webpack` 技术来提供一个应用程序, 该应用程序可以快速加载并根据需要获取功能。该技术的两种方式都有其各自的优点。

在下一章中, 您将学习实现服务器端渲染。