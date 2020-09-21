## 整理
当前配置不会在两次构建之间清除*构建*目录。结果, 随着项目的修改, 它会继续累积文件。鉴于这可能会令人烦恼, 您应该在两次构建之间进行清理。

另一个不错的选择是将有关构建本身的信息作为每个文件顶部的小注释包括到生成的包中, 至少包括版本信息。

### 清理构建目录
这个问题可以通过使用 `webpack` 插件解决, 也可以在插件之外解决。您可以在 `npm` 本中触发 `rm-rf./build&&webpack` 或 `rimraf./build&&webpack`, 保证其可以跨平台使用。任务运行器也可以为此目的工作。

#### 设置 CleanWebpackPlugin
首先安装 [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin):
```bash
npm add clean-webpack-plugin --develop
```

接下来, 您需要定义一个函数来包装基本思想。您可以直接使用插件, 但这感觉像是可以跨项目使用的东西, 因此将其推送到库中是有意义的:

**webpack.parts.js**
```js
......
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

exports.clean = path => ({
  plugins: [new CleanWebpackPlugin()],
});
```

将其与配置文件连接:

**webpack.config.js**
```js{3}
......
const commonConfig = merge([
  parts.clean(),
  ......
]);
```
::: warning-zh | 
要使 `webpack 5` 与插件一起工作, 必须显式地设置 `output.path`。在这种情况下, 在 **`webpack.config.js`** 中将其设置为 `path.resolve(process.cwd(), "dist")`。
:::

### 将修订添加到构建
将与当前构建修订版相关的信息附加到构建文件本身可用于调试。[webpack.BannerPlugin](https://webpack.js.org/plugins/banner-plugin/) 允许您实现这一目标。它可以与 [git-revision-webpack-plugin](https://www.npmjs.com/package/git-revision-webpack-plugin) 结合使用, 以在生成的文件的开头生成一个小的注释。

#### 设置 BannerPlugin 和 GitRevisionPlugin
首先, 安装插件:
```bash
npm add git-revision-webpack-plugin --develop
```
然后在 `webpack.parts.js` 中定义一个函数:

**webpack.parts.js**
```js
......
const webpack = require("webpack");
const GitRevisionPlugin = require("git-revision-webpack-plugin");

exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
});
```

并将其与主配置连接:

**webpack.config.js**
```js{3}
const productionConfig = merge([
  ......
  parts.attachRevision(),
]);
```

如果您构建项目(`npm run build`), 则应注意所构建的文件开头包含注释 `/*! 0b5bb05 */` 或 `/*! v1.7.0-9-g5f82fe8 */`。

可以通过调整 `banner` 进一步定制输出。您还可以使用 `webpack.DefinePlugin` 将修订信息传递给应用程序。在["环境变量"]()一章中详细讨论了该技术。
::: warning-zh | 
该代码期望您在 `Git` 存储库中运行它! 否则, 您将得到一个 `fatal: Not a git repository (or any of the parent directories): .git` 错误。如果您不使用 `Git`, 则可以用其他数据替换 `banner`。
:::

### 复制文件
复制文件是您可以使用 `webpack` 处理的另一种普通操作。如果您需要将外部数据带入内部, 而 `webpack` 不直接指向外部数据, 则可以考虑使用 [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin)。

如果要以跨平台方式在 `webpack` 外部复制文件, [cpy-cli](https://www.npmjs.com/package/cpy-cli) 是一个不错的选择。根据定义, 插件应该是跨平台的。

### 结论
通常, 您通过发现一个问题, 然后找到一个插件来解决它。在 `webpack` 之外解决这些类型的问题是完全可以接受的, 但是 `webpack` 通常也可以处理这些问题。

回顾一下:
- 您可以找到许多可作为任务使用的小插件, 并将 `webpack` 推向任务运行器。
- 这些任务包括清理构建和部署。在["部署应用"]()一章中详细讨论了后者的话题。
- 最好在生产版本中添加一些注释, 以告知已部署的版本。这样, 您可以更快地调试潜在问题。
- 像这些辅助任务可以在 `webpack` 之外执行。如果您正在使用["多页"]()一章中讨论的多页设置, 则这很有必要。