## 使用软件包
有时, 软件包没有按照您期望的方式打包, 因此您必须调整 `webpack` 解析它们的方式。`Webpack` 提供了多种方法来实现这一目标。

### resolve.alias
有时软件包不遵循标准规则, 并且软件包的 `package.json` 包含错误的 `main` 字段。也可能完全缺失。`resolve.alias` 是用于处理该情况的字段, 如下所示:
```js
{
  resolve: {
    alias: {
      demo: path.resolve(
        __dirname,
        "node_modules/demo/dist/demo.js"
      ),
    },
  },
},
```
其思想是, 如果 `webpack` 解析器在一开始时与 `demo` 匹配, 它将从 `target` 解析。您可以使用像 `demo$` 这样的模式将流程限制为一个确切的名称。

轻量级的 `Rea​​ct` 替代品, 例如 [Preact](https://www.npmjs.com/package/preact) 或 [Inferno](https://www.npmjs.com/package/inferno), 在牺牲诸如 `propTypes` 和合成事件处理之类的功能的同时, 提供了更轻巧的解决方案。用轻量级的替代品代替 `React` 可以节省大量空间, 如果这样做, 您应该获得良好的测试体验。

使用 `Preact`, 基本设置如下所示:
```js
const config = {
  resolve: {
    alias: {
      react: "preact-compat",
      "react-dom": "preact-compat",
    },
  },
};
```
::: tip-zh | 
同样的技术也适用于加载器。您可以使用类似的 `resolveLoader.alias`。您可以使用该方法来使 `RequireJS` 项目与 `webpack` 配合使用。
:::

### resolve.extensions
默认情况下, 在导入时, `webpack` 仅针对 `.js`, `.mjs` 和 `.json` 文件解析, 而无需使用扩展名, 对其进行调整以包括 `JSX` 文件, 请进行如下调整:
```js
{
  resolve: {
    extensions: [".js", ".json", ".jsx"],
  },
},
```

### resolve.modules
模块解析过程可以通过改变 `webpack` 寻找模块的位置来改变。默认情况下, 它只会在 `node_modules` 目录进行查找。如果希望覆盖已有的软件包, 可以告诉 `webpack` 首先查看其它目录:
```js
{
  resolve: {
    modules: ["my_modules", "node_modules"],
  },
},
```

更改后, `webpack` 将优先尝试查找 `my_modules` 目录。该方法可适用于要自定义行为的大型项目。

### resolve.plugins
`resolve.plugins` 字段可让您自定义 `webpack` 解析模块的方式。可参考以下插件示例:
- [directory-named-webpack-plugin](https://www.npmjs.com/package/directory-named-webpack-plugin) 将针对目录的导入映射到与目录名匹配的文件。例如, 它将映射 `import foo from "./foo";` 到 `import foo from "./foo/foo.js";`。该模式在 `React` 中很常见, 使用该插件将使您简化代码。[babel-plugin-module-resolver](https://www.npmjs.com/package/babel-plugin-module-resolver) 通过 `Babel` 实现相同的行为。
- [webpack-resolve-short-path-plugin](https://www.npmjs.com/package/webpack-resolve-short-path-plugin) 的设计避免了深度嵌套的 `import`, 例如 `import foo from "../../../foo";` 通过添加对 **tilde**(`~`) 语法的支持。如果使用了插件, `import foo from "~foo"` 将针对项目根目录进行解析。

### 使用 webpack 之外的软件包
浏览器依赖项, 如 `jQuery`, 通常通过 `CDN` 提供服务。`CDN` 允许您将加载流行软件包的问题推到其他地方。如果已经从 `CDN` 加载了一个包, 并且它在用户缓存中, 则不需要再次加载它。

要使用此技术, 首先应将相关依赖项通过 `externals` 进行标记:
```js
externals: {
  jquery: "jquery",
},
```

您仍然必须并在不理想的情况下提供本地回退方案, 因此, 如果 `CDN` 对客户端不起作用, 则需要额外加载一些内容:
```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script>
  window.jQuery ||
    document.write(
      '<script src="js/jquery-3.1.1.min.js"><\/script>'
    );
</script>
```

### 与全局作用域打交道
有时模块取决于全局变量。`jQuery` 提供的 `$` 就是一个很好的例子。`Webpack` 提供了几种方法来处理它们。

#### 注入全局变量
[imports-loader](https://www.npmjs.com/package/imports-loader) 允许您按以下方式注入全局变量:
```js
{
  module: {
    rules: [
      {
        // Resolve against package path.
        // require.resolve returns a path to it.
        test: require.resolve("jquery-plugin"),
        loader: "imports-loader?$=jquery",
      },
    ],
  },
},
```

#### 解析全局变量
`Webpack` 的 `ProvidePlugin` 允许在遇到全局变量时解析它们:
```js
{
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
  ],
},
```

#### 将全局变量暴露给浏览器
有时, 您必须将软件包公开给第三方脚本。[exposure-loader](https://www.npmjs.com/package/expose-loader) 允许执行以下操作:
```js
{
  test: require.resolve("react"),
  use: "expose-loader?React",
},
```

进行一些细微的调整, 该技术可用于通过全局 `React.Perf` 向浏览器公开 `React` 性能实用程序。您必须在应用程序入口文件插入以下代码, 此功能才能起作用:
```js
if (process.env.NODE_ENV !== "production") {
  React.Perf = require("react-addons-perf");
}
```

::: tip-zh | 
最好将 [React Developer Tools](https://github.com/facebook/react-devtools) 安装到 `Chrome` 以获取更多信息, 因为它使您可以检查应用程序的 `props` 和 `state`。
:::
::: tip-zh | 
[script-loader](https://www.npmjs.com/package/script-loader) 允许您在全局上下文中执行脚本。如果您使用的脚本依赖于全局注册设置, 则必须执行此操作。
:::

### 移除未使用的模块
即使软件包开箱即用, 但有时它们会给您的项目带来太多的代码。[moment.js](https://www.npmjs.com/package/moment) 是一个很受欢迎的例子。默认情况下, 它将语言环境数据带到您的项目中。

禁用该行为的最简单方法是使用 `IgnorePlugin` 忽略语言环境:
```js
const config = {
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
};
```

::: tip-zh | 
可以使用相同的机制来解决有问题的依赖关系。例如: `new webpack.IgnorePlugin(/^(buffertools)$/)`。
:::

要将特定的语言环境引入项目, 应使用 `ContextReplacementPlugin`:
```js
const config = {
  plugins: [
    new webpack.ContextReplacementPlugin(
      /moment[\/\\]locale$/,
      /de|fi/
    ),
  ],
};
```

::: tip-zh | 
有一个 **Stack Overflow** 的[问题](https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack/25426019), 详细讨论了这些想法。另请参阅 [Ivan Akulov 对 ContextReplacementPlugin 的解释](https://iamakulov.com/notes/webpack-contextreplacementplugin/)。
:::
::: tip-zh | 
[webpack-libs-optimizations](https://github.com/GoogleChromeLabs/webpack-libs-optimizations) 列出了上述特定于库的其他优化。
:::

### 管理预构建依赖项
`webpack` 可能会给出以下有关某些依赖项的警告:
```bash
WARNING in ../~/jasmine-promises/dist/jasmine-promises.js
Critical dependencies:
1:113-120 This seems to be a pre-built javascript file. Though this is possible, it's not recommended. Try to require the original source to get better results.
 @ ../~/jasmine-promises/dist/jasmine-promises.js 1:113-120
```

如果一个软件包指向一个预构建(即缩小并已处理)的文件, 则可能抛出警告。`Webpack` 会检测到这种情况并发出警告。

如上所述, 可以通过将软件包别名为源版本来消除警告。如果源代码有时不可用, 另一个选择是使用 `module.noParse` 告诉 `webpack` 跳过对文件的解析。 它接受正则表达式或正则表达式数组, 可以按以下方式配置:
```js
{
  module: {
    noParse: /node_modules\/demo-package\/dist\/demo-package.js/,
  },
},
```

::: warning-zh | 
禁用警告时要小心, 因为它可能隐藏潜在的问题。首先考虑替代方案。[webpack issue 1617](https://github.com/webpack/webpack/issues/1617), 详细讨论了该问题。
:::

### 管理软链接
软链接(`Symbolic links` 或 `symlinks`)是操作系统级别的功能, 它使您可以通过文件系统指向其他文件, 而无需复制它们。您可以用于 `npm link` 为正在开发的程序包创建全局软链接, 然后用于 `npm unlink` 删除链接。

`Webpack` 像 `Node` 一样将软链接解析为其完整路径。问题是, 如果您不了解解析规则, 则该行为会使您感到奇怪, 尤其是在您依赖于 `webpack` 处理的情况下。可以按照 `webpack` 问题 [#1643](https://github.com/webpack/webpack/issues/1643) 和 [#985](https://github.com/webpack/webpack/issues/985) 中讨论的那样来解决。`Webpack` 的核心行为将来可能会有所改善, 从而使这些变通办法变得不必要。

::: tip-zh | 
您可以通过将设置 `resolve.symlinks` 为 `false` 来禁用 `webpack` 的软链接处理。
:::

### 深入了解软件包
要获取更多信息, npm提供了 `npm info <package>` 命令用于基本查询。您可以使用它来检查与软件包关联的元数据, 同时找出与版本相关的信息。还可以使用以下工具:
- [package-config-checker](https://www.npmjs.com/package/package-config-checker) 更进一步。它使您可以更好地了解项目的哪些软件包最近进行了更新, 并提供了深入了解依赖项的方法。例如, 它可以揭示哪些软件包可以使用与下载大小相关的改进。
- [slow-deps](https://www.npmjs.com/package/slow-deps) 可以显示项目的哪些依赖项安装最慢。
- 当以不同的方式(未压缩、缩小、`gzip`)提供给浏览器时, 可以使用 [weigh](https://www.npmjs.com/package/weigh) 计算出包的大致大小。

### 结论
`Webpack` 可以毫无问题地使用大多数 `npm` 软件包。但是, 有时需要使用 `webpack` 的解析机制进行修改。

回顾一下:
- 使用 `webpack` 的模块解析可以使您受益。有时, 您可以通过调整解析方式来解决问题。不过, 尝试将修改推向项目本身通常是一个好主意。
- `Webpack` 允许您修补已解析的模块。给定特定的依赖关系(全局变量除外), 您可以注入它们。您还可以将模块公开为全局变量, 因为这对于某些开发工具来说是必需的。