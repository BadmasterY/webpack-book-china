## Module federation
[微前端](https://micro-frontends.org/)将微服务的思想引入到了前端开发中。与其将应用程序或站点作为一个整体来开发, 不如将其拆分为单独编程的较小部分, 然后在运行时将它们捆绑在一起。

通过这种方法, 您可以使用不同的技术来开发应用程序的其他部分, 并可以由单独的团队来开发它们。理由是, 以这种方式拆分开发可避免与传统整体式项目相关的维护成本。

副作用是, 由后端开发人员和前端开发人员专注于应用程序的特定部分, 因此可以在后端开发人员和前端开发人员之间进行新的协作方式。例如, 您可以让一个团队仅关注搜索功能或围绕核心功能的其他关键业务部分。

从 `webpack 5` 开始, 有内置的功能可以开发微前端。**Module federation**, 并为您提供足够的功能来解决微前端方法所需的工作流。

::: tip-zh | 
要了解有关 `module federation` 的更多信息, 请[参阅示例](https://github.com/module-federation/module-federation-examples/)和 [Zack Jackson 关于该主题的文章](https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669)。
:::

### 示例
要开始使用 `module federation`, 让我们构建一个小型应用程序, 然后将其拆分为使用该技术加载的特定捆绑包。该应用程序的基本要求如下:
1. 应该有一个包含项列表的 `UI` 控件。点击一个项目应该显示相关信息。
2. 应该有一个带有应用程序标题的 `header`。
3. 根据要求 `1`, 应该有一个与控制器相连的主体部分。

可以将上面的代码建模为 `HTML`:
```html
<body>
  <header>Module federation demo</header>
  <aside>
    <ul>
      <li><button>Hello world</button></li>
      <li><button>Hello federation</button></li>
      <li><button>Hello webpack</button></li>
    </ul>
  </aside>
  <main>
    The content should change based on what's clicked.
  </main>
</body>
```

这个想法是, 当单击任何按钮时, `main` 都会更新以匹配文本。

### 添加 webpack 配置
如下设置 `webpack` 的配置:

**webpack.mf.js**
```js
const path = require("path");
const { mode } = require("webpack-nano/argv");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");

const cssLoaders = [parts.autoprefix(), parts.tailwind()];

const commonConfig = merge([
  parts.clean(),
  parts.loadJavaScript(),
  parts.loadImages(),
  parts.page({
    entry: {
      app: path.join(__dirname, "src", "mf.js"),
    },
    mode,
  }),
]);

const configs = {
  development: merge([
    parts.devServer(),
    parts.extractCSS({ loaders: cssLoaders }),
  ]),
  production: merge([
    parts.extractCSS({
      options: { hmr: true },
      loaders: cssLoaders,
    }),
  ]),
};

module.exports = merge(commonConfig, configs[mode], { mode });
```

配置是到目前为止我们在书中使用配置的子集。它依赖于 `.babelrc` 以下内容:

**.babelrc**
```.babelrc
{
  "presets": [
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ]
  ]
}
```

设置 `npm` 脚本, 如下所示:

**package.json**
```json
{
  "scripts": {
    "build:mf": "wp --config webpack.mf.js --mode production",
    "start:mf": "wp --config webpack.mf.js --mode development",
    ......
  },
  ......
}
```

思想是一个脚本来运行项目, 一个脚本来构建项目。

如果要进一步改进设置, 请按照相关章节中的说明向其中添加[模块热更新](../Appendices/hmr)。

::: tip-zh | 
如果您还没有完成本书的示例, [请查看GitHub上的演示](https://github.com/survivejs-demos/webpack-demo)以找到配置。
:::

### 用 React 实现应用
为了避免手动操作 `DOM`, 我们可以使用 `React` 快速开发应用程序。确保同时安装了 **`react`** 和 **`react-dom`**。

**src/mf.js**
```js
import ReactDOM from "react-dom";
import React from "react";
import "./main.css";

function App() {
  const options = [
    "Hello world",
    "Hello federation",
    "Hello webpack",
  ];
  const [content, setContent] = React.useState(
    "The content should change based on what's clicked."
  );

  return (
    <main className="max-w-md mx-auto space-y-8">
      <header className="h-32 flex flex-wrap content-center">
        <h1 className="text-xl">Module federation demo</h1>
      </header>
      <aside>
        <ul className="flex space-x-8">
          {options.map((option) => (
            <li key={option}>
              <button
                className="rounded bg-blue-500 text-white p-2"
                onClick={() => setContent(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <article>{content}</article>
    </main>
  );
}

const container = document.createElement("div");
document.body.appendChild(container);
ReactDOM.render(<App />, container);
```

样式部分设置了 `Tailwind` 进行样式设置, 因此我们可以使演示看起来更好看一些。当前演示应用禁用了 ["加载图片"](../Loading/images) 一章中 `body` 的背景图像, 以使输出看起来更整洁。

如果是 `npm run start:mf`, 如果您单击任意按钮, 则应该看到该应用程序正在良好运行。

::: warning-zh | 
在继续进行之前, 请确保已在项目中安装并设置了 `webpack 5`。
:::

### 分离引导
> bootstrap: 这里使用计算机术语翻译为引导。

下一步是将这个整体分解成单独的模块。实际上, 这些部分可以是不同的项目, 并采用不同的技术进行开发。

首先, 我们应该使用 `webpack` 的 `ModuleFederationPlugin` 并异步加载应用程序。加载的变化是由于 `module federation` 的工作方式造成的。因为这是一个运行时操作, 所以需要一个小的引导文件。

将引导文件添加到项目中, 如下所示:

**src/bootstrap.js**
```js
import("./mf");
```

它使用的是您可能还记得的["代码拆分"](../Building/code-splitting)章节中的语法。虽然这感觉很繁琐, 但我们还是需要执行此步骤, 否则在使用 `ModuleFederationPlugin` 加载时, 应用程序将发出错误信息。

要测试新的引导程序和插件, 请按如下方式调整 `webpack` 配置:
```js{1,10-11,15-26}
const { ModuleFederationPlugin } = require("webpack").container;
......

const commonConfig = merge([
  parts.clean(),
  parts.loadJavaScript(),
  parts.loadImages(),
  parts.page({
    entry: {
      // app: path.join(__dirname, "src", "mf.js"),
      app: path.join(__dirname, "src", "bootstrap.js"),
    },
    mode,
  }),
  {
    plugins: [
      new ModuleFederationPlugin({
        name: "app",
        remotes: {},
        shared: {
          react: { singleton: true },
          "react-dom": { singleton: true },
        },
      }),
    ],
  },
]);
......
```
如果您运行应用程序(`npm run start:mf`), 则其外观没有任何变化。

如果您将入口更改为原始文件(`mf.js`), 则会在浏览器中收到如下错误消息: `Uncaught Error: Shared module is not available for eager consumption`。

首先, 让我们将应用程序的 `header` 部分拆分成独立的模块, 并在运行时通过 `module federation` 加载它。

注意上面代码中的 `singleton`。在这种情况下, 我们将当前代码视为主机, 并将 **`react`** 和 **`react-dom`** 标记为每个联合模块单例, 以确保每个模块都使用相同的版本, 避免 `React` 渲染出现问题。

### 分离 header
现在我们处于可以拆分整体的位置。使用 `header` 代码设置文件, 如下所示:

**src/header.js**
```js
import React from "react";

function Header() {
  return (
    <header className="h-32 flex flex-wrap content-center">
      <h1 className="text-xl">Module federation demo</h1>
    </header>
  );
}

export default Header;
```

我们还应该更改应用程序以使用新组件。我们将遍历自定义名称空间 `mf`, 它将通过 `module federation` 进行管理: 

**src/mf.js**
```js{2,8-11}
......
import Header from "mf/header";

function App() {
  ......
  return (
    <main className="max-w-md mx-auto space-y-8">
      {/*<header className="h-32 flex flex-wrap content-center">
        <h1 className="text-xl">Module federation demo</h1>
      </header>*/}
      <Header />
      ......
    </main>
  );
}
......
```

接下来, 我们应该使用该模块与我们的配置连接起来。在这里, 事情变得更加复杂, 因为我们必须以多编译器模式(配置数组)运行 `webpack` 或单独编译模块。鉴于它在当前配置下效果更好, 我使用后一种方法。

::: tip-zh | 
也可以使该配置在多编译器中工作。在这种情况下, 您应该使用 `webpack-dev-server` 或在服务器模式下运行 `webpack-plugin-serve`。请参阅其文档中的[完整示例](https://github.com/shellscape/webpack-plugin-serve/blob/master/test/fixtures/multi/webpack.config.js)。
:::

为了使更改更易于管理, 我们应该定义一个配置, 以封装相关的关注点, 然后使用它:

**webpack.parts.js**
```js
const { ModuleFederationPlugin } = require("webpack").container;

exports.federateModule = ({
  name,
  filename,
  exposes,
  remotes,
  shared,
}) => ({
  plugins: [
    new ModuleFederationPlugin({
      name,
      filename,
      exposes,
      remotes,
      shared,
    }),
  ],
});
```
下一步将涉及更多, 因为我们必须配置两个构建。我们将重用当前目标并向其传递 `--component` 参数以定义要编译的目标。这为项目提供了足够的灵活性。

如下更改 `webpack` 配置:

**webpack.mf.js**
```js{1-2,4,13-34,39,41-88}
// const { component, mode } = require("webpack-nano/argv");
// const { ModuleFederationPlugin } = require("webpack").container;

const { component, mode } = require("webpack-nano/argv");

......

const commonConfig = merge([
  parts.clean(),
  parts.loadJavaScript(),
  parts.loadImages(),

  // parts.page({
  //   entry: {
  //     app: path.join(__dirname, "src", "mf.js"),
  //   },
  //   mode,
  // }),
  // {
  //   plugins: [
  //     new ModuleFederationPlugin({
  //       name: "app",
  //       remotes: {},
  //       shared: {
  //         react: {
  //           singleton: true,
  //         },
  //         "react-dom": {
  //           singleton: true,
  //         },
  //       },
  //     }),
  //   ],
  // },
]);

......

// module.exports = merge(commonConfig, configs[mode], { mode });

const getConfig = (mode) => {
  const shared = {
    react: { singleton: true },
    "react-dom": { singleton: true },
  };

  const componentConfigs = {
    app: merge([
      parts.page({
        entry: {
          app: path.join(__dirname, "src", "bootstrap.js"),
        },
        mode,
      }),
      parts.federateModule({
        name: "app",
        remotes: {
          mf: "mf@/mf.js",
        },
        shared,
      }),
    ]),
    header: merge([
      {
        entry: path.join(__dirname, "src", "header.js"),
      },
      parts.federateModule({
        name: "mf",
        filename: "mf.js",
        exposes: {
          "./header": "./src/header",
        },
        shared,
      }),
    ]),
  };

  return merge(
    commonConfig,
    configs[mode],
    componentConfigs[component],
    {
      mode,
    }
  );
};

module.exports = getConfig(mode);
```

要进行测试, 请首先使用 `npm run build:mf -- --component header` 编译 `header` 组件。然后, 要用 `shell` 运行已构建的模块, 请使用 `npm run start:mf -- --component app`。

如果一切顺利, 您仍然应该获得相同的结果。

### 利弊
您可以说我们的构建过程现在更复杂了, 那么我们得到了什么？使用这个设置, 我们基本上将应用程序分成两个部分, 可以独立开发。配置不必存在于同一个存储库中, 代码可以使用不同的技术创建。

给定 `module federation` 是一个运行时进程, 它提供了一定程度的灵活性, 否则很难实现。例如, 您可以运行实验, 看看如果在不重建整个项目的情况下替换了某个功能, 会发生什么。

在团队级别上, 该方法允许您拥有只在应用程序的特定部分工作的功能团队。除非您发现进行 `AB` 测试和推迟编译的可能性很重要, 否则对于单个开发人员来说, 整体开发还是一个不错的选择。

### 学到更多
考虑以下资源以了解更多信息:
- [官方文档](https://webpack.js.org/concepts/module-federation/)
- [module-federation/module-federation-examples](https://github.com/module-federation/module-federation-examples/)
- [mizx/module-federation-examples](https://github.com/mizx/module-federation-examples)
- [webpack 5 和 module federation - 微前端革命](https://dev.to/marais/webpack-5-and-module-federation-4j1i)
- [微前端的状态](https://blog.bitsrc.io/state-of-micro-frontends-9c0c604ed13a)

### 结论
`webpack 5` 中引入的 `module federation` 提供了用于开发微前端的基础架构级解决方案。

回顾一下:
- **`module federation`** 是微前端架构基于工具的实现
- `ModuleFederationPlugin` 是解决方案的技术实施
- 转换项目以使用插件时, 请设置一个异步加载的入口文件
- 使用这种方法带来了更多的项目复杂性, 但同时又允许您以前所未有的方式拆分项目
