## 组合配置
尽管到目前为止, `webpack` 所做的工作还不是很多, 但配置的数量却以肉眼可见的速度增长。现在您必须小心其组成方式, 因为在项目中有单独的生产和开发目标。当您想添加更多功能进行测试和其他用途时, 情况只会变得更糟。

使用单个整体配置文件会影响可读性, 并降低复用性。随着项目需求的增多, 您必须找出更有效地管理 `webpack` 配置的方法。

### 可行的管理配置方式
您可以通过以下方式管理 `webpack` 配置:

- 在不同环境的多个文件中维护配置, 并通过 <mark>--config</mark> 参数将 `webpack` 指向每个文件, 通过导入模块共享配置。
- 使用相关的库来维护配置。示例: [webpack-config-plugins](https://github.com/namics/webpack-config-plugins), [Neutrino](https://neutrino.js.org/), [webpack-blocks](https://www.npmjs.com/package/webpack-blocks)。
- 交由工具来维护配置。示例: [create-react-app](https://www.npmjs.com/package/create-react-app), [kyt](https://www.npmjs.com/package/kyt), [nwb](https://www.npmjs.com/package/nwb)。
- 在单个文件中维护所有配置, 然后在其中分支并依靠 <mark>--mode</mark> 参数。该方法将在本章稍后详细说明。

我的首选方法是使用一组小函数组合成 `webpack` 配置。本书的开发是基于这种形式展开的, 因为它为您提供了可以逐步解决问题的能力, 同时为您提供了基于 `webpack` 配置和相关技术的小型 `API`。

### 通过合并组合配置
在基于组合的方法中, 您将 `webpack` 配置拆分, 然后将其合并在一起。问题是, 使用 <mark>Object.assign</mark> 等特性合并对象的常规方法不能正确处理数组, 因为如果两个对象都有相同命名的数组, 就会丢失数据。处于这个原因, 我开发了 [webpack-merge](https://www.npmjs.org/package/webpack-merge)。

**webpack-merge** 其核心做了两件事: 拼接数组和合并对象, 而不是简单的覆盖它们。下面的示例详细显示了该行为:
```js
const { merge } = require("webpack-merge")
merge(
    { a: [1], b: 5, c: 20 },
    { a: [2], b: 10, d: 421 }
);
// => { a: [ 1, 2 ], b: 10, c: 20, d: 421 }
```
**webpack-merge** 通过策略提供了更多控制, 使您可以按字段控制其行为。它们使您可以强制它附加, 添加或替换内容。

尽管 **webpack-merge** 是为本书设计的, 但事实证明, 它不仅是本书的学习工具。如果您觉得它好用的话, 可以尝试把它带到您的工作中去。

::: tip-zh | 
[webpack-chain](https://www.npmjs.com/package/webpack-chain) 提供了用于配置 `webpack` 的链式 `API`, 使您能够在启用合成时避免与配置相关的问题。
:::

### 设置 `webpack-merge`
首先, 将 **`webpack-merge`** 添加到项目中:
```bash
npm add webpack-merge --develop
```
为了提供一定程度的抽象, 您可以为更高级别的配置定义 `webpack.config.js`, 为要使用的配置部分定义 `webpack.parts.js`。这是开发服务器的功能:

**webpack.parts.js**
```js
const { WebpackPluginServe } = require("webpack-plugin-serve");
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");

exports.devServer = () => ({
  watch: true,
  plugins: [
    new WebpackPluginServe({
      port: process.env.PORT || 8080,
      static: "./dist", // Expose if output.path changes
      liveReload: true,
      waitForBuild: true,
    }),
  ],
});

exports.page = ({ title }) => ({
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title,
      },
    }),
  ],
});
```
::: tip-zh | 
为了简单起见, 我们将使用 `JavaScript` 开发所有配置。在这里也可以使用 `TypeScript`。如果您想这样做, 请参阅[加载JavaScript]()一章了解所需的 `TypeScript` 配置。
:::

要连接此配置, 请按照以下代码示例进行 `webpack.config.js` 配置:

**webpack.config.js**
```js
const { mode } = require("webpack-nano/argv");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");

const commonConfig = merge([
  {
    entry: ["./src", "webpack-plugin-serve/client"],
  },
  parts.page({ title: "Webpack demo" }),
]);

const productionConfig = merge([]);

const developmentConfig = merge([parts.devServer()]);

const getConfig = (mode) => {
  switch (mode) {
    case "production":
      return merge(commonConfig, productionConfig, { mode });
    case "development":
      return merge(commonConfig, developmentConfig, { mode });
    default:
      throw new Error(`Trying to use an unknown mode, ${mode}`);
  }
};

module.exports = getConfig(mode);
```
在这些更改之后, 构建的行为应该与以前相同。不过现在您有了扩展的空间, 并且您不必担心如何组合配置的不同部分。

您可以通过扩展 `package.json` 定义并根据需要在 `webpack.config.js` 上分支来添加更多目标。`webpack.parts.js` 为包含特定的技术, 然后您可以使用这些技术来组合配置。

::: tip-zh | 
目前 <mark>productionConfig</mark> 是一个保留项, 随着我们进一步扩展配置, 它会被逐渐完善。
:::
::: tip-zh | 
代码中使用的 [process](https://nodejs.org/api/process.html) 模块是由 `Node` 提供的全局变量。除 `env` 之外, 它还提供了许多其他功能, 可让您获取主机系统的更多信息。
:::
::: warning-zh | 
默认情况下, [webpack 不基于 mode 设置全局 NODE_ENV](https://github.com/webpack/webpack/issues/7074)。如果您有任何外部工具依赖它(如 `Babel`), 请确保显式地设置它。为此, 在 `webpack` 配置函数中设置 `process.env.NODE_ENV = mode;`
:::

### 组合配置的好处
组合配置有几个好处:
- 将配置拆分成较小的功能可以让您继续扩展配置。
- 如果您正在使用诸如 `TypeScript` 的语言, 则可以使用 `type function`。
- 如果您在多个项目使用配置, 则可以将配置作为包发布, 然后只需要修改基础配置的一个位置便可以优化和升级。[SurviveJS - Maintenance](https://survivejs.com/maintenance/) 涵盖了与该方法有关的实践。
- 将配置视为一个包, 可以将其进行版本控制, 并提供更改日志以将更改记录在案。
- 如果实现的足够完善, 您最终可以拥有自己的 **create-react-app**, 它可以用您喜欢的首选配置快速生成项目。

> 译者注: **SurviveJS - Maintenance** 为另一个内容(英文文档), 不做过多介绍, 感兴趣可以自行查阅。

### 配置布局
在本书项目中, 您将所有配置推送到两个文件中: `webpack.config.js` 和 `webpack.parts.js`。前者包含较高级别的配置, 而较低级别则将与 `webpack` 细节隔离。可选择的方法允许比我们现有的方法具备更灵活的文件布局。

#### 按配置目标拆分
如果按目标分割配置, 则可能会得到如下文件结构:
```
.
└── config
    ├── webpack.common.js
    ├── webpack.development.js
    ├── webpack.parts.js
    └── webpack.production.js
```
在这种情况下, 您将通过 `webpack` 的 `--config` 参数指向目标, 并通过 `merge` 进行通用配置: `module.exports = merge(common, config)`;

#### 按用途拆分
要将层次结构添加到管理配置部件的方式中, 可以拆分 `webpack.parts.js` 的每个类别:
```
.
└── config
    ├── parts
    │   ├── devserver.js
    ...
    │   ├── index.js
    │   └── javascript.js
    └── ...
```
这种安排可以更快地找到与类别相关的配置。此外, 如果您要使用已发布包中的配置, 它还可以减少构建时间, 因为这样只需要加载所需的插件。为了提高可读性, 一个不错的选择是在单个文件中放置所有方法, 并使用注释将其拆分。

### 构建自己的配置包指南
如果您使用我提到的配置包方法, 请考虑以下准则:
- 使用 `TypeScript` 开发软件包定义接口是有意义的。如要在 `TypeScript` 中编写配置, ["加载JavaScript"]()一章中讨论的那样将十分有用。
- 一次仅公开包含一项功能的函数。例如, 这样做可以轻松替换[模块热更新](../Appendices/hmr.html)的实现方式。
- 通过函数参数提供足够的定制选项。最好公开一个对象, 这样可以模拟 `JavaScript` 中的命名参数。然后, 您可以从中解构参数, 同时将其与默认值和 `TypeScript` 类型优雅结合。
- 在配置包中包含所有相关的依赖项。在特定情况下, 如果希望使用者能够控制特定版本, 可以使用 `peerDependencies`。这样做意味着您可能会下载更多所需的依赖项, 但这是一个很好的折衷方案。
- 对于包含加载器字符串的参数, 请使用 `require.resolve` 针对配置包中的加载器进行解析。否则, 在寻找加载器的错误位置时, 构建可能会失败。
- 包装装载器时, 请在函数参数中使用相关的 `TypeScript` 类型。
- 考虑使用快照声明输出更改来测试软件包(在 `Jest` 中使用 `expect().toMatchSnapshot()`)。

诀窍是将 [memory-fs](https://www.npmjs.com/package/memory-fs) 与 `compiler.outputFileSystem` 通过以下各项结合使用:
```js
const webpack = require("webpack");
const MemoryFs = require("memory-fs");
const _ = require("lodash");
const config = require("./webpack.config");

const compiler = webpack(config);
compiler.outputFileSystem = new MemoryFs();
compiler.run((err, stats) => {
  // 1. Handle possible err and stats.hasErrors() case
  if (err || stats.hasErrors()) {
    // stats.toString("errors-only") contains the errors
    return reject(err);
  }

  const pathParts = compiler.outputFileSystem // Check webpack fs
    .pathToArray(__dirname)
    .concat(["dist", "main.js"]);

  // https://lodash.com/docs/4.17.15#get
  const file = _.get(
    compiler.outputFileSystem.data,
    pathParts
  ).toString();

  // 3. TODO: Assert the file using your testing framework.
});
```
::: tip-zh | 
相关讨论, 请参见 [Stack Overflow](https://stackoverflow.com/questions/39923743/is-there-a-way-to-get-the-output-of-webpack-node-api-as-a-string)。
:::

### 结论
即使配置在技术上与以前相同, 现在您仍然可以通过 `merge` 来扩展它。

回顾一下:
- 鉴于 `webpack` 的配置位于 `JavaScript` 代码中, 有很多方法可以对其进行管理。
- 您应该选择一种对您最有意义的配置方法。开发 [webpack-merge](https://www.npmjs.com/package/webpack-merge) 是为了提供一种简便的组合方法, 但是您可以找到许多其他的选择。
- 组合可以实现配置共享。您不必维护每个存储库的自定义配置, 而是可以通过组合的方式在存储库之间共享它。使用 `npm` 软件包可以做到这一点。开发配置接近于开发任何其他代码。但是这一次, 您将您的实践整理为软件包。

本书的下一部分将介绍不同的技术, 并会大量修改 `webpack.parts.js`。但幸运的是, 对 `webpack.config.js` 的更改是微乎其微的。