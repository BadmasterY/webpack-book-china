## Source map
![Chrome 中的 Source Map](../../build/build_chrom_source_map.webp)

当您的源代码经过转换后, 在浏览器中进行调试将成为问题。**`Source map`** 通过在原始源代码和转换后的源代码之间提供**映射**来解决此问题。除了将源代码编译为 `JavaScript` 之外, 这还适用于样式设置。

一种方法是在开发过程中跳过 `Source map`, 并依靠浏览器对语言功能的支持。如果您使用不带任何扩展的 `ES2015` 并使用现代浏览器进行开发, 则可以正常工作。这样做的好处是可以避免与 `source map` 有关的所有问题, 同时可以获得更好的性能。

如果您使用的是 `webpack 4` 或更高版本以及该 `mode` 选项, 该工具将以 `development` 模式自动为您生成 `source map`。但是, 生产使用需要注意。

::: tip-zh | 
如果您想更详细地了解 `source map` 的思想, 请阅读 [Ryan Seddon 对该主题的介绍](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)。
:::
::: tip-zh | 
要了解 `webpack` 如何处理 `source map`, 请参见该工具作者的 [source-map-visualization](https://sokra.github.io/source-map-visualization/)。
:::

### 内联 source map 和单独 source map
`Webpack` 可以生成内联或单独的 `source map` 文件。内联代码包含在产出的捆绑包中, 由于性能更好, 因此在开发过程中很有价值。单独的文件便于生产使用, 因为加载 `source map` 是可选的。

可能不希望为您的产品捆绑包生成 `source map`, 因为这使得别人可以毫不费力地检查您的应用程序。通过禁用 `source map`, 您正在执行某种混淆处理。

无论您是否要为生产模式启用 `source map`, 它们都便用于转移。跳过源地图可加快构建速度, 因为以最佳质量生成 `source map` 可能是一项复杂的操作。

**隐藏的 `source map`** 仅提供堆栈跟踪信息。您可以将它们与监视服务连接起来, 以便在应用程序崩溃时获取跟踪, 从而可以解决有问题的情况。虽然这不是理想的方法, 但知道可能的问题总比不知道要好。

### 启用 source map
`Webpack` 提供了两种启用 `source map` 的方法。有一个 `devtool` 快捷方式字段。您还可以找到两个提供更多可调整选项的插件。本章末尾将简要讨论这些插件。除了 `webpack`, 还必须在用于开发的浏览器上启用对 `source map` 的支持。

#### 在 webpack 中启用 source map
首先, 您可以将核心思想包装在 `webpack.parts.js` 中。如果需要, 可以将其转换为以后使用插件:

**webpack.parts.js**
```js
exports.generateSourceMaps = ({ type }) => ({
    devtool: type,
});
```
`Webpack` 支持多种 `source-map` 类型。这些类型的不同取决于质量和构建速度。现在, 您可以为生产启用 `source-map`, 并让 `webpack` 使用默认值进行开发。配置如下:

**webpack.config.js**
```js{2}
const productionConfig = merge([
  parts.generateSourceMaps({ type: "source-map" }),
  ......
]);
```
`source-map` 是所有产品中最慢和最高质量的选择, 但这对于生产版本来说很好。

如果您现在构建项目(`npm run build`), 则应该在输出中看到源映射:
```bash
Hash: 53d2c4e897619ee2a33f
Version: webpack 4.43.0
Time: 2775ms
Built at: 07/10/2020 2:02:04 PM
       Asset       Size  Chunks                   Chunk Names
  index.html  237 bytes          [emitted]
    main.css   8.53 KiB       0  [emitted]        main
main.css.map   85 bytes       0  [emitted] [dev]  main
     main.js   1.21 KiB       0  [emitted]        main
 main.js.map   5.13 KiB       0  [emitted] [dev]  main
Entrypoint main = main.css main.js main.css.map main.js.map
......
```
> 译者注: 截止至 `webpack@5.0.0_beta.31`, 由于 `webpack` 无法输出 `.map` 文件创建信息, 使用书上的例子代替。

好好看看那些 `.map` 文件。这就是生成文件和源文件之间的映射。在开发期间, 它将映射信息写入包中。

#### 在浏览器中启用 source map
要在浏览器中使用 `source map`, 必须按照特定于浏览器的说明显式启用源映射:
- [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging)
- [FireFox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
- [IE Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide/debugger#source-maps)
- [Safari](https://support.apple.com/guide/safari/use-the-safari-develop-menu-sfri20948/mac)

::: warning-zh | 
如果您想使用断点(如, `debugger`或多个通过浏览器设置的断点), 基于 `eval` 的选项将无法在 `Chrome` 中使用!
:::
### webpack 支持的 source map 类型
`webpack` 支持的 `source map` 类型可以分为两类:

- **内联** `source map` 将映射数据直接添加到生成的文件中。
- **单独** `source map` 将映射数据作为单独的 `source map` 文件产出, 并使用注释将源链接到它们。隐藏的源映射故意省略注释。

由于其速度快, 内联 `source map` 非常适合开发。但考虑到它使捆绑包体积变大, 单独的 `source map` 是生产的首选解决方案。如果性能开销可以接受, 那么在开发期间也可以使用单独的 `source map`。

### 内联 source map 类型
`Webpack` 提供了多个内联 `source map` 类型。通常, 通常 `eval` 是起点, 并且 [webpack issue#2145](https://github.com/webpack/webpack/issues/2145#issuecomment-409029231) 建议使用 `inline-module-source-map`, 因为它是速度和质量之间的一个很好的折衷方案, 同时在 `Chrome` 和 `Firefox` 浏览器中可靠工作。

为了更好地了解可用选项, 下面列出了这些选项, 同时为每个选项提供了一个小示例。这些示例是通过以下额外的 `webpack` 设置生成的:
- `optimization.moduleIds = "named"` 旨在提高可读性。如果您正在使用[代码拆分](), 那么最好也进行 `optimization.chunkIds` 设置。
- `mode` 设置为 `false` 避免 `webpack` 的默认处理

#### devtool: "eval"
`eval` 生成代码, 其中每个模块都封装在 `eval` 函数中:
```js
/***/ "./src/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _main_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"./src/main.css\");\n/* harmony import */ var _main_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_main_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./src/component.js\");\n\n\ndocument.body.appendChild(Object(_component__WEBPACK_IMPORTED_MODULE_1__[\"default\"])());\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),
```

#### devtool: "cheap-eval-source-map"
`cheap-eval-source-map` 更进一步, 它包括代码的 `base64` 编码版本作为数据 `url`。结果仅包含行数据, 而丢失列映射。如果解码生成的 `base64` 字符串, 则会得到以下输出:
```js
{
  "version": 3,
  "file": "./src/index.js.js",
  "sources": ["webpack:///./src/index.js?3700"],
  "sourcesContent": [
    "import './main.css';\nimport component from \"./component\";\ndocument.body.appendChild(component());"
  ],
  "mappings": "AAAA;AAAA;AAAA;AAAA;AAAA;AACA;AACA",
  "sourceRoot": ""
}
```

#### devtool: "cheap-module-eval-source-map"
`cheap-module-eval-source-map` 使用相同的想法, 只是具备更高的质量, 相对的性能更低, 对数据进行解码会揭示更多:
```js
{
  "version": 3,
  "file": "./src/index.js.js",
  "sources": ["webpack:///./src/index.js?b635"],
  "sourcesContent": ["import './main.css';\nimport component ..."],
  "mappings": "AAAA;AAAA;AAAA;AAAA;AAAA;AACA;AAEA",
  "sourceRoot": ""
}
```
在这种情况下, 选项之间的差距很小。

#### devtool: "eval-source-map"
`eval-source-map` 是内联选项中质量最高的选项。它也是产出数据最多、性能最低的一个:
```js
{
  "version": 3,
  "sources": ["webpack:///./src/index.js?b635"],
  "names": ["document", "body", "appendChild", "component"],
  "mappings": "AAAA;AAAA;AAAA;AAAA;AAAA;AACA;AAEAA,QAAQ,CAACC,IAAT,CAAcC,WAAd,CAA0BC,0DAAS,EAAnC",
  "file": "./src/index.js.js",
  "sourcesContent": ["import './main.css';\nimport component ..."],
  "sourceRoot": ""
}
```

### 单独 source map 类型
`Webpack` 还可以生成生产环境友好使用的 `source map`。这些文件最终以 `.map` 扩展名结尾, 并仅在需要时由浏览器加载。这样, 您的用户就可以获得良好的性能, 同时您也可以更轻松地调试应用程序。

`source-map` 在这里是一个合理的默认值。即使用这种方式生成源映射需要更长的时间, 但您可以获得最佳质量。如果您不关心生产环境 `source map`, 则可以跳过设置, 从而获得更好的性能。

#### devtool: "hidden-source-map"
`hidden-source-map` 与 `source-map` 相同, 只是它不将对 `source map` 的引用写入源文件。如果您不希望在进行堆栈跟踪时直接将 `source map` 公开给开发工具, 那么这很方便。

#### devtool: "nosources-source-map"
`nosources-source-map` 创建一个没有 `sourcesContent` 的 `source map`。但是, 您仍然可以获得堆栈跟踪。如果您不想向客户端公开源代码, 则此选项很有用。
::: tip-zh | 
[官方文档](https://webpack.js.org/configuration/devtool/#devtool)包含有关 `devtool` 选项的更多信息。
:::

#### devtool: "cheap-source-map"
`cheap-source-map` 类似于上面的 `cheap` 选项。结果将丢失列映射。另外, 来自加载器(如 **`cssloader`**)的 `source map` 将不会被使用。

在本例中, 检查 `.map` 文件会显示以下输出:
```js
{
  "version": 3,
  "file": "main.js",
  "sources": [
    "webpack:///webpack/bootstrap",
    "webpack:///./src/component.js",
    "webpack:///./src/index.js",
    "webpack:///./src/main.css"
  ],
  "sourcesContent": [
    "...",
    "// extracted by mini-css-extract-plugin"
  ],
  "mappings": ";AAAA;...;;ACFA;;;;A",
  "sourceRoot": ""
}
```
源代码在其末尾包含 <mark>//# sourceMappingURL=main.js.map</mark> 类型的注释以映射到此文件。

#### devtool: "cheap-module-source-map"
`cheap-module-source-map` 与之前的选项相同, 只是将加载器的 `source map` 简化为每行一个映射。在这种情况下, 它将产生以下输出:
```js
{
  "version": 3,
  "file": "main.js",
  "sources": [
    "webpack:///webpack/bootstrap",
    "webpack:///./src/component.js",
    "webpack:///./src/index.js",
    "webpack:///./src/main.css"
  ],
  "sourcesContent": [
    "...",
    "// extracted by mini-css-extract-plugin"
  ],
  "mappings": ";AAAA;...;;ACFA;;;;A",
  "sourceRoot": ""
}
```

::: warning-zh | 
如果启用压缩功能, 则 `cheap-module-source-map` 会被破坏。参见 [webpack issue#4176](https://github.com/webpack/webpack/issues/4176)。
:::

#### devtool: "source-map"
`source-map` 提供了最佳质量和完整的结果, 但它也是最慢的选择。输出反映了这一点:
```js
{
  "version": 3,
  "sources": [
    "webpack:///webpack/bootstrap",
    "webpack:///./src/component.js",
    "webpack:///./src/index.js",
    "webpack:///./src/main.css"
  ],
  "names": [
    "text",
    "element",
    "document",
    "createElement",
    "className",
    "innerHTML",
    "body",
    "appendChild",
    "component"
  ],
  "mappings": ";AAAA;...;;ACFA;;;;A",
  "file": "main.js",
  "sourcesContent": [
    "...",
    "// extracted by mini-css-extract-plugin"
  ],
  "sourceRoot": ""
}
```
### 其他 source map 选项
还有一些选项会影响 `source map` 的生成:
```js
const config = {
  output: {
    // Modify the name of the generated source map file.
    // You can use [file], [id], and [hash] replacements here.
    // The default option is enough for most use cases.
    sourceMapFilename: "[file].map", // Default

    // This is the source map filename template. It's default
    // format depends on the devtool option used. You don't
    // need to modify this often.
    devtoolModuleFilenameTemplate:
      "webpack:///[resource-path]?[loaders]",

    // create-react-app uses the following as it shows up well
    // in developer tools
    devtoolModuleFilenameTemplate: (info) =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
  },
};
```
::: tip-zh | 
在[官方文档](https://webpack.js.org/configuration/output/#output-sourcemapfilename)中深入了解 `output` 细节。
:::

### SourceMapDevToolPlugin 和 EvalSourceMapDevToolPlugin
如果要对 `source map` 的生成进行更多控制, 可以使用 [SourceMapDevToolPlugin](https://webpack.js.org/plugins/source-map-dev-tool-plugin/) 或 `EvalSourceMapDevToolPlugin` 代替。后者是一个比较有限的替代方案, 并且正如其名称所指出的那样, 它对基于 `eval` 生成的 `source map` 非常方便。

这两个插件都可以更精细地控制要为哪些部分的代码生成 `source map`, 同时还可以通过 `SourceMapDevToolPlugin` 严格控制结果。使用任何一个插件都可以完全跳过该 `devtool` 选项。

`webpack` 默认情况下仅为 ` .js` 和 `.css` 文件匹配 `source map`, 您可以用 `SourceMapDevToolPlugin` 来解决此问题。这可以通过 ``test`` 模式来实现, 如: `/\.(js|jsx|css)($|\?)/i`。

`EvalSourceMapDevToolPlugin` 仅接受如上所述的 `module` 和 `lineToLine` 选项。因此, 可以将其视为 `devtool: "eval"` 的别名, 同时支持更高的灵活性。

### 更改 source map 前缀
可以在 `source map` 选项的前缀中添加注入 `source map` 引用的 **`pragma`** 字符。`Webpack` 默认使用现代浏览器支持的 `#`, 因此您不必设置它。

要覆盖它, 您必须在 `source map` 选项之前添加前缀(例如 `@source-map`)。更改之后, 假设使用了单独的 `source map` 类型, 您应该在 `JavaScript` 文件中看到 `//@` 类型的 `source map` 引用。

### 使用依赖的 source map
假设您使用的软件包在其发行版中使用了内联 `source map`, 则可以使用 [source-map-loader]() 使 `webpack` 处理它们。无需针对软件包进行配置, 您将获得最小的调试输出。通常, 您可以跳过此步骤, 因为这是特例。

### 样式的 source map
如果要为样式文件启用 `source map`, 可以通过启用该 `sourceMap` 选项来实现。相同的想法适用于样式加载器, 例如 **`css-loader`**, **`sass-loader`** 和 **`less-loader`**。

当您在 `import` 中使用相对路径时, **`css-loader`** 存在问题, 这是一个[已知有问题](https://github.com/webpack-contrib/css-loader/issues/232)。要解决此问题, 您应该设置 `output.publicPath` 解析服务器 `URL`。

### 后端 source map
如果按照["构建目标"]()一章中讨论的那样将 `target: node` 与 `webpack` 一起使用, 则仍应生成 `source map`。诀窍是如下配置:
```js
const config = {
  output: {
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
  },
  plugins: [webpack.SourceMapDevToolPlugin({})],
};
```

### 忽略与 source map 有关的警告
有时, 第三方依赖性会导致浏览器控制台中输出与 `source map` 相关的警告。`Webpack` 允许您按以下方式过滤消息:
```js
const config = {
  stats: {
    warningsFilter: [/Failed to parse source map/],
  },
};
```

### 结论
`source map` 在开发过程中可能很方便。它们提供了调试应用程序更优雅的方法, 因为您仍然可以在产出的代码中检查原始代码。它们甚至对于生产版本来说都是有价值的, 并且允许您在提供应用程序的客户端友好版本(`client-friendly version`)时调试问题。

回顾一下:
- `source map` 在开发和生产过程中都很有用。它们提供有关正在发生的事情的信息, 并加快调试速度。
- `Webpack` 支持内联和单独类别中的许多 `source map` 变体。内联 `source map` 由于其速度快, 在开发过程中非常方便。单独的 `source map` 适用于生产版本, 因为是否加载它们是可选的。
- `devtool: "source-map"` 是对生产版本有价值的最高质量选项。
- `inline-module-source-map` 是一个很好的开发起点。
- 使用 `devtool: "hidden-source-map"` 在生产过程中获取堆栈跟踪, 并将其发送给第三方服务, 供您稍后检查和修复。
- `SourceMapDevToolPlugin` 和 `EvalSourceMapDevToolPlugin` 相比 `devtool` 配置, 提供了更多的对结果的控制。
- 您应该将 **`source-map-loader`** 与第三方依赖一起使用。
- 为样式启用 `source map` 需要额外的配置工作。您必须为所使用的与样式相关的加载器启用 `sourceMap` 选项。

在下一章中, 您将学习代码拆分的技巧。