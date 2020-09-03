## 故障排除
使用 `webpack` 过程中可能会产生各种运行时警告或错误。通常, 构建的某个特定部分由于某种原因而失败。可以通过以下流程来解决这些问题:
1. 将 <mark>--display-error-details</mark> 标志传递给 `webpack` 以获得更准确的错误信息来定位错误。如: <mark>npm run build -- --display-error-details</mark>。
2. 仔细研究错误发生在哪里。有时您可以推断出上下文有什么问题。如果 `webpack` 无法解析模块, 则可能不会将其传递给您期望的加载器。
3. 尝试了解错误的根源。它来自您的代码, 依赖项还是 `webpack`?
4. 删除代码, 直到错误消失, 然后再添加代码, 直到再次出现。尽可能简化以发现问题。
5. 如果代码在另一个项目中正常工作, 请找出有什么不同。项目之间的依赖关系可能会有所不同, 或者设置会有所不同。在最坏的情况下, 您所依赖的程序包可能会回退。因此, 使用 <mark>lockfile</mark> 是个好主意。
6. 仔细研究相关软件包。有时仔细研究一下 <mark>package.json</mark> 可以获得一些见解。您使用的软件包可能无法按预期方式解析。
7. 在线搜索错误。也许有人曾经遇到过。 [Stack Overflow](https://stackoverflow.com/questions/tagged/webpack) 和[官方问题跟踪器](https://github.com/webpack/webpack/issues)是不错的选择。
8. 启用 <mark>stats: "verbose"</mark> 可从 `webpack` 中获取更多信息。在[官方文档介绍更多的标志](https://webpack.js.org/configuration/stats/)。
9. 在错误附近添加一个临时 <mark>console.log</mark>, 以便更深入地了解问题。更好的选择是[通过 Chrome Dev Tools 调试 webpack](https://medium.com/webpack/webpack-bits-learn-and-debug-webpack-with-chrome-dev-tools-da1c5b19554)。
10. 在 [Stack Overflow](https://stackoverflow.com/questions/tagged/webpack) 上提问或使用[官方的 Gitter 频道](https://gitter.im/webpack/webpack)。
11. 如果这一切依旧无法解决问题, 并且您确信自己已找到错误, 请在[官方问题跟踪器](https://github.com/webpack/webpack/issues)或其他适当的位置报告问题(如果它是从属关系中的问题)。请仔细遵循问题模板, 并提供一个最小的可运行示例, 因为它有助于解决问题。

将错误放到搜索引擎中或许是获得答案的最快方式。除此之外, 还有一个很好用的调试命令。如果您的配置在过去有效, 则还可以考虑使用 [git-bisect](https://git-scm.com/docs/git-bisect) 之类的工具来找出已知工作状态(过去)和当前故障状态(当前)之间的变化。

接下来, 您将了解最常见的错误以及如何处理它们。

### 入口文件未找到
::: error-zh | 
Entry module not found
:::

如果将入口路径指向一个不存在的位置, 则可能会出现此错误。错误消息告诉您 `webpack` 找不到该路径。

### 模块未找到
::: error-zh | 
... Module not found
:::

您可以通过两种方式产出此错误。通过修改加载器定义使其指向不存在的加载器, 或者修改代码中的导入路径以使其指向不存在的模块。该消息指出了要解决的问题。

### 模块解析失败
::: error-zh | 
Module parse failed
:::

即使 `webpack` 可以很好地解析您的模块, 它仍然可能无法构建它们。如果您使用的是加载器无法理解的语法, 则可能发生这种情况。您在处理过程中可能遗漏了一些东西。

### 找不到加载器
::: error-zh | 
Loader Not Found
:::

还有另一个与加载器有关的细微错误。如果存在与未实现加载器接口的加载程序名称匹配的软件包, 则 `webpack` 与此匹配, 并给出运行时错误, 指出该软件包不是加载器。

如果您配置 <mark>loader: "eslint"</mark> 而不是 <mark>loader: "eslint-loader"</mark>, 则会收到此错误。如果该软件包根本不存在, 则将引发错误 <mark>Module not found</mark>。

### 模块构建失败: Unkonw word
::: error-zh | 
Module build failed: Unknown word
:::

此错误属于同一类别。解析文件成功, 但是语法未知。问题很可能是拼写错误, 但是当 `webpack` 通过导入并遇到了无法理解的语法时, 也会发生此错误。这很可能意味着该特定文件类型缺少加载器。

### 语法错误: 意外的标记
::: error-zh | 
SyntaxError: Unexpected token
:::

同一类别的另一个错误: <mark>SyntaxError</mark>。如果您使用未随 `terser` 一起转译的 `ES2015` 语法, 则可能发生此错误。由于遇到无法识别的语法构造, 因此会引发错误。

### 弃用警告
::: error-zh | 
DeprecationWarning
:::

在 `webpack` 更新到新的主要版本后, Node可能会给出的特别提示: <mark>DeprecationWarning</mark>。您使用的插件或加载程序可能需要更新。通常, 所需的更改很小。要弄清楚警告的来源, 请通过 `node` 运行 `webpack`: <mark>node --trace-deprecation node_modules/.bin/wp --mode production</mark>。

将 <mark>--trace-deprecation</mark> 标志传递给 `node` 以查看警告的来源很重要。使用 <mark>--trace-warnings</mark> 是另一种方式, 它将捕获所有警告(不仅是弃用)的跟踪信息。

### 结论
这些仅是错误的示例。特定错误发生在 `webpack` 中, 但其余错误来自它通过加载器和插件使用的软件包。简化项目是一个很好的做法, 因为这样可以更轻松地了解错误发生的位置。

在大多数情况下, 如果您知道要查找的位置, 就可以快速解决这些错误, 但在最坏的情况下, 您会遇到一个错误, 需要在工具中进行修复。在这种情况下, 您应该为项目提供高质量的报告, 并帮助解决它。

