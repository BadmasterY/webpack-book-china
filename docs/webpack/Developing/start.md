## 起步
在开始之前, 请确保您使用的是最新版本的 [Node](https://nodejs.org/)。您应该至少使用最新的 `LTS`(长期支持)版本, 因为本书的配置使用了 `Node TLS` 相关的功能。您应该确保终端上的 `node` 和 `npm` 命令可用。[Yarn](https://yarnpkg.com/) 是 `npm` 的一个很好的替代方法, 也适用于本教程。

通过使用诸如 [Docker](https://www.docker.com/), [Vagrant](https://www.vagrantup.com/) 或 [nvm](https://www.npmjs.com/package/nvm) 之类的解决方案, 可以获得更受控制的环境。`Vagrant` 依赖于虚拟机, 因此性能会偏差一些。`Vagrant` 在团队中很有价值: 每个开发人员都可以拥有相同且接近生产环境的开发环境。

::: tip-zh | 
完整的配置可在 [GitHub](https://github.com/survivejs-demos/webpack-demo) 上找到。
:::

### 设置项目
首先, 请为项目创建一个目录, 然后在目录中创建一个 `package.json`, 因为 `npm` 使用它来管理项目依赖项。
```bash
mkdir webpack-demo
cd webpack-demo
npm init -y # -y generates `package.json`, skip for more control
```
即使部分操作会自动为您修改文件, 您可以手动调整生成的 `package.json` 以对其进行进一步的更改。官方文件更详细地解释了 [package.json 选项](https://docs.npmjs.com/files/package.json)。
::: tip-zh | 
您可以在 `~/.npmrc` 中设置 `npm init` 的默认值。
:::
::: tip-zh | 
这是使用 [Git](https://git-scm.com/) 设置版本控制的绝佳机会。您可以在每个步骤中创建提交, 并在每个章节中进行标记, 因此如果有需要, 可以更轻松地来回切换。
:::

### 安装 webpack
尽管 `webpack` 可以全局安装(<mark>npm add webpack -g</mark>), 但最好还是将其作为项目的依赖项进行维护以避免出现问题, 因为这样您就可以控制所运行的确切版本。

该方法可与**持续集成**(`CI`)很好地配合使用, 并且 `CI` 系统可以安装本地依赖项, 使用它们来编译项目, 然后将结果推送到服务器。

要将 `webpack` 添加到项目, 请执行:
```bash
npm add webpack webpack-nano --develop # --develop === -D
```
> 译者注: 原版书籍使用 `webpack` 版本为 **4.44.1**, 译文使用 **5.0.0-beta.29**。  
> 同时, 不知道是系统问题还是配置问题, `--develop` 识别出错, 但是 `-D` 可用。

之后, 您应该可以在 `package.json` `devDependencies` 部分中看到 **`webpack`** 和 **`webpack-nano`**。除了将软件包本地安装在 `node_modules` 目录下之外, `npm` 还会为可执行文件生成一个目录, 您可以在 `node_modules/.bin` 目录中找到这些可执行文件。

我们使用了 **`webpack-nano`** 而不是官方的 [webpack-cli](https://www.npmjs.com/package/webpack-cli), 因为它具有用于本书项目的足够的功能, 同时与 `webpack 4` 和 `5` 直接兼容。

`webpack-cli` 附带了其他功能, 包括 `init` 和 `migrate` 命令, 这些命令使您可以快速创建新的 `webpack` 配置并从较旧的版本更新为较新的版本。
> 译者注: `webpack-cli` 预计等到 `webpack 5` 稳定之后才会对其进行兼容性更新, 所以, 在稳定之前, `webpack-cli` 不支持 `webpack 5`。有关描述可以看一下 [webpack-cli issue 1726](https://github.com/webpack/webpack-cli/issues/1726#issuecomment-667625492)。
::: tip-zh | 
如果要使用 `webpack 5` 来运行示例, 请使用 `npm add webpack@next` 进行安装。
:::

### 执行 webpack
您可以使用 `npm bin` 来显示可执行文件的确切路径。它很有可能指向 `./node_modules/.bin`。尝试使用 `node_modules/.bin/wp` 或类似命令通过终端从那里运行 `webpack`。

运行之后, 您应该会看到一个版本, 指向命令行界面指南的链接以及大量选项。大多数都没有在该项目中使用, 但是最好知道此工具包含其他功能。
```bash
$ node_modules/.bin/wp

⬡ webpack: Build Finished
⬡ webpack: Hash: 083797a410744b04dac1
  Version: webpack 5.0.0-beta.29
  Time: 234 ms
  Built at: 2020-09-07 13:35:06
  1 asset
  Entrypoint main = main.js
  
  WARNING in configuration
  The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
  You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/
  
  ERROR in main
  Module not found: Error: Can't resolve './src' in '/Users/yuzhoujie/Desktop/others/webpack-demo'
```

输出表明 `webpack` 找不到要编译的源。理想情况下, 我们还要向其传递 `mode` 参数以定义所需的默认值。

要编译 `webpack`, 请执行以下操作:

1. 进行设置 `src/index.js`, 其中包含 `console.log("Hello world")`;。
2. 执行 `node_modules/.bin/wp`。`Webpack` 将通过 `Node` 约定发现源文件。
3. 检查 `dist/main.js`。您应该看到开始执行代码的 `webpack` 引导程序代码。在引导程序下方, 您应该找到一些熟悉的东西。

### 设置资源
为了使构建更加复杂, 我们可以向项目添加另一个模块并开始开发一个小型应用程序:

**src/component.js**
```js
export default (text = "Hello world") => {
  const element = document.createElement("div");
  element.innerHTML = text;
  return element;
};
```

我们还必须修改原始文件以导入新文件并通过 `DOM` 呈现应用程序:

**src/index.js**
```js
import component from "./component";

document.body.appendChild(component());
```
使用上述命令生成项目后检查输出。您应该可以在 `webpack` 生成的 `dist` 目录的捆绑包中看到这两个模块。不过, 还有一个问题。如何在浏览器中测试应用程序？

### 使用 mini-html-webpack-plugin
这个问题可以通过编写指向生成文件的 <mark>index.html</mark> 文件来解决。我们可以使用插件和 `webpack` 配置来完成这项工作, 而不需要自己动手。

首先, 安装 [mini-html-webpack-plugin](https://www.npmjs.com/package/mini-html-webpack-plugin):
```bash
npm add mini-html-webpack-plugin --develop
```
> 译者注: 使用的最新版本 `mini-html-webpack-plugin@3.0.7`, 与 `webpack 5.x` 版本不兼容! 无法实现 `CSS` 热更新, 如果需要正常使用/开发, 请务必使用 `webpack@4.44.1`。

::: tip-zh | 
[html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) 是一个具备更多功能的选项, 可以通过插件进行扩展。对于任何超出基本用法的内容, 这是一个不错的选择。
:::

要将插件与 `webpack` 连接, 请按如下所示进行配置:

**webpack.config.js**
```js
const { mode } = require("webpack-nano/argv");
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");

module.exports = {
  mode,
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title: "Webpack demo",
      },
    }),
  ],
};
```
现在配置已完成, 您应该尝试以下操作:

1. 使用 <mark>node_modules/.bin/wp --mode production</mark> 构建项目。您也可以尝试 `development` 和 `none` 模式。
2. 使用 <mark>cd dist</mark> 进入构建目录。
3. 使用 <mark>serve</mark> (<mark>npm add serve -g</mark> 或 <mark>npx serve</mark>)或您熟悉的类似命令运行服务器。

::: tip-zh | 
<mark>none</mark> 模式不应用任何默认值。用于调试。
:::

通过浏览器查看结果。您应该在那里看到一条熟悉的问候消息:
![Hello world!](../../start/start_1.png)

::: tip-zh | 
除了配置对象外, `webpack` 还接受一系列配置。例如, 您还可以返回 `Promise` 并最终返回 `resolve` 到配置。如果要从第三方来源获取与配置相关的数据, 则后者很有用。
:::

::: warning-zh | 
`Webpack` 的入口和输出具有默认配置。默认情况下, 它从 <mark>./src</mark> 中寻找源文件, 并将其输出到 <mark>./dist</mark>。您可以通过["什么是Webpack"](../What-is-webpack.html)一章中的 <mark>entry</mark> 和 <mark>output</mark> 来分别控制它们。
:::

### 检查输出
如果执行 <mark>node_modules/.bin/wp --mode production</mark>, 应该会看到输出:
```bash
$ node_modules/.bin/wp --mode production

⬡ webpack: Build Finished
⬡ webpack: Hash: 77b99c0f9a9f1f7262a6
  Version: webpack 5.0.0-beta.29
  Time: 292 ms
  Built at: 2020-09-07 14:03:40
  asset index.html 198 bytes [emitted]
  asset main.js 136 bytes [emitted] [minimized] (name: main)
  Entrypoint main = main.js
  ./src/index.js + 1 modules 223 bytes [built]
      + 1 hidden module 
```

输出显示:
- `Hash: 77b99c0f9a9f1f7262a6` —— 构建的哈希值。您可以使用它通过 <mark>[hash]</mark> 占位符使资产无效。在[将哈希添加到文件名]()一章中详细讨论哈希。
- `Version: webpack 5.0.0-beta.29` —— `Webpack` 版本。
- `Time: 292ms` —— 执行构建所花费的时间。
- `asset index.html 198 bytes [emitted]` —— 流程产生的另一个生成的资源。
- `asset main.js 136 bytes [emitted] [minimized] (name: main)` —— 所生成资产的名称, 大小, 告诉其如何生成的状态信息, 块的名称。
- `./src/index.js + 1 modules 223 bytes [built]` —— 名称, 大小, 生成方式。

> 译者注: 最后一条输出, 在 `webpack 4` 中为 `[0] ./src/index.js + 1 modules 227 bytes {0} [built]` —— `entry` 资源的 `ID`, 名称, 大小, `entry` 块 `ID`, 生成方式。

检查 `dist/` 目录下的输出。如果仔细观察, 您会在源中看到相同的 `ID`。

### 添加快捷方式
每次执行编译都需要输入 `node_modules/.bin/wp` 很麻烦, 可以通过修改 `package.json` 文件来简化我们的操作:

**package.json**
```json
{
  "scripts": {
    "build": "wp --mode production"
  }
}
```

运行 `npm run build` 可以得到与以前相同的输出。`npm` 将临时添加 `node_modules/.bin` 到路径中以启用此功能。因此您无需使用 `"build": "node_modules/.bin/wp"`, 而是通过简单的 `"build": "wp"` 进行调用。

您可以通过 *`npm run`* 执行此类脚本, 并且可以在项目中的任何位置使用该命令。如果运行不带任何参数的命令(`npm run`), 它将为您提供可用脚本的列表。

::: tip-zh | 
如果要同时运行多个命令, 请参见 [concurrently](https://www.npmjs.com/package/concurrently) 软件包。它被设计为在提供整洁输出的同时允许同时运行多个命令。
:::

### Webpack 输出插件
鉴于 `webpack` 给出的输出可能难以解读, 因此存在多个选项:
- [webpackbar](https://www.npmjs.com/package/webpackbar) 专门用于跟踪构建进度。
- 也可以使用 <mark>webpack.ProgressPlugin</mark>, 开箱即用。
- [webpack-dashboard](https://www.npmjs.com/package/webpack-dashboard) 在标准 `webpack` 输出上提供了整个基于终端的仪表盘。如果您希望获得清晰的视觉输出, 这个插件会派上用场。
- [test-webpack-reporter-plugin](https://www.npmjs.com/package/test-webpack-reporter-plugin) 抽象化了 `webpack` 的内部结构, 使编写自己的报告程序更加容易。

### 结论
即使您已经成功启动并运行了 `webpack`, 但它目前并没有做太多事情。如果在开发中使用它会很痛苦, 因为我们必须一直重新编译。这就是为什么我们在下一章中探讨 `webpack` 的更高级功能的原因。

回顾一下:
- 使用本地安装的webpack是一个好主意, 有助于确定自己使用哪一版本的 `webpack`, 本地依赖关系也适用于**持续集成**环境。
- `Webpack` 通过 **`webpack-cli`** 提供了一个命令行界面, 即使没有配置也可以使用, 但是任何高级用法都需要配置。**webpack-nano** 是仅使用基本用法的不错选择。
- 必须单独编写一个 `webpack.config.js` 文件来编写复杂的设置。
- **`mini-html-webpack-plugin`** 和 **`HtmlWebpackPlugin`** 可以用来为应用程序生成一个 `HTML` 入口文件。 在["多页"]()一章中, 您将看到如何使用插件生成多个单独的页面。
- 使用 `npm` **`package.json`** 脚本来管理 `webpack` 是很方便的。可以将其用作轻型任务运行程序, 并在 `webpack` 之外使用系统功能。

在下一章中, 您将学习如何通过启用自动刷新浏览器来改善开发人员的体验。