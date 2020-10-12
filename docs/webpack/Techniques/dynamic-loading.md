## 动态加载
尽管在["代码拆分"](../Building/code-splitting)中已经介绍了有关 `webpack` 的代码拆分功能, 但还可以学到更多内容。`Webpack` 通过一种更动态的方式, 通过 `require.context` 来处理代码。

### 动态加载 require.context
[require.context](https://webpack.js.org/api/module-methods/#require-context) 提供代码拆分的一般形式。假设您正在 `webpack` 上编写一个静态站点生成器。您可以在目录结构中建立站点内容的模型, 方法是使用 `./pages/` 目录, 该目录将包含 `markdown` 文件。

这些文件的元数据都有一个 `YAML` 主题。每个页面的 `url` 可以根据文件名确定并映射为一个页面。要使用 `require.context` 对想法进行建模, 您可能需要使用以下代码:
```js
// Process pages through `yaml-frontmatter-loader` and `json-loader`.
// The first one extracts the front matter and the body and the latter
// converts it into a JSON structure to use later. Markdown
// hasn't been processed yet.
const req = require.context(
  "json-loader!yaml-frontmatter-loader!./pages",
  true, // Load files recursively. Pass false to skip recursion.
  /^\.\/.*\.md$/ // Match files ending with .md.
);
```
::: tip-zh | 
加载器定义可以推送到 `webpack` 配置。内联表单用于使示例看起来更加精简。
:::

`require.context` 将函数返回给 `require`。它还知道它的模块 `id`, 并提供一个 `keys()` 方法来计算上下文的内容。为了给您一个更好的例子, 请考虑下面的代码:
```js
req.keys(); // ["./demo.md", "./another-demo.md"]
req.id; // 42

// {title: "Demo", body: "# Demo page\nDemo content\n\n"}
const demoPage = req("./demo.md");
```
该技术可以用于其他目的, 比如测试或添加要监听的 `webpack` 文件。在这种情况下, 可以在文件中设置一个 `require.context`。然后通过 `webpack` 的 `entry` 指向该文件。

::: warning-zh | 
如果您使用的 `typescript`, 确保你已经安装了 `@types/webpack-env` 来使 `require.context` 正常工作。
:::

### 动态路径与动态 import
同样的想法适用于动态 `import`。可以通过传递一个不完整的路径。`Webpack` 在内部设置上下文。这里有一个简单的示例:
```js
// Set up a target or derive this somehow
const target = "fi";

// Elsewhere in code
import(`translations/${target}.json`).then(...).catch(...);
```

同样的想法也适用于 `require`, 因为 `webpack` 可以执行静态分析。例如: `require(assets/modals/${imageSrc}.js);` 将生成一个上下文, 并根据已传递给 `require` 的 `imageSrc` 来处理图像。

::: tip-zh | 
使用动态 `import` 时, 通过在路径中指定文件扩展名, 保持较小的上下文, 这有助于提高性能。
:::

### 组合多个 require.context
可以将多个单独的 `require.context` 合并到一个函数中, 方法是将它们包装在一个函数内:
```js
const { concat, uniq } = require("lodash");

const combineContexts = (...contexts) => {
  function webpackContext(req) {
    // Find the first match and execute
    const matches = contexts
      .map((context) => context.keys().indexOf(req) >= 0 && context)
      .filter((a) => a);

    return matches[0] && matches[0](req);
  }
  webpackContext.keys = () =>
    uniq(
      concat.apply(
        null,
        contexts.map((context) => context.keys())
      )
    );

  return webpackContext;
};
```

### 处理动态路径
鉴于此处讨论的方法依赖于静态分析, 并且 `webpack` 必须查找有问题的文件, 因此它不适用于所有可能的情况。如果您需要的文件在另一台服务器上或必须通过特定的端口进行访问, 则仅仅使用 `webpack` 是不够的。

在这种情况下, 考虑在 `webpack` 上使用 [\$script.js](https://www.npmjs.com/package/scriptjs) 或 [little-loader](https://www.npmjs.com/package/little-loader) 之类的浏览器端加载器。

### 结论
尽管 `require.context` 是一个专一特性, 但最好能了解它。如果必须对文件系统中的多个可用文件执行查找, 那么它将变得非常有价值。如果您的查找比这更复杂, 那么您必须借助于允许您执行加载运行时的其他替代方法。

回顾一下:
- `require.context` 是一项高级功能, 通常隐藏在幕后。如果必须对大量文件执行查找, 请使用它。
- 以某种形式编写的动态 `import` 文件会生成一个 `require.context` 调用。在这种情况下, 代码的读取效果会更好一些。
- 该技术仅适用于文件系统。如果必须对 `URL` 进行操作, 则应考虑客户端解决方案。