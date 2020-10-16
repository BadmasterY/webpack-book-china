## 加载器定义
`Webpack` 提供了多种配置模块加载器的方法。每个加载器都是一个接受输入并返回输出的函数。它们可能会产生副作用, 因为它们会散发到文件系统, 并且可能拦截执行以实现缓存。

### 加载器剖析
`Webpack` 支持开箱即用的常见 `JavaScript` 格式。通过设置一个或多个加载器, 并将这些加载器与目录结构连接起来, 可以使用加载器处理其他格式。在下面的示例中, `webpack` 通过 `Babel` 处理 `JavaScript`:

**webpack.config.js**
```js
const config = {
  module: {
    rules: [
      {
        // **Conditions** to match files using RegExp, function.
        test: /\.js$/,

        // **Restrict** matching to a directory.
        include: path.join(__dirname, "app"),
        exclude: (path) => path.match(/node_modules/);

        // **Actions** to apply loaders to the matched files.
        use: "babel-loader",
      },
    ],
  },
};
```
::: tip-zh | 
如果不确定特定的 `RegExp` 是否正确匹配, 请考虑使用在线工具, 例如 [regex101](https://regex101.com/), [RegExr](https://regexr.com/), [Regexper](https://regexper.com/) 或 [ExtendsClass RegEx Tester](https://extendsclass.com/regex-tester.html)。
:::
::: tip-zh | 
在 `webpack 5` 中, 提供了一种实验语法。要使用它, 请设置 <mark>experiments.assets</mark> 为 `true`。之后, 您可以使用 <mark>type: "asset"</mark> 而不需要定义加载, 而 `webpack` 可以立即完成正确的事情。`webpack` 的[简单资源示例](https://github.com/webpack/webpack/tree/master/examples/asset-simple)和[复杂资源示例](https://github.com/webpack/webpack/tree/master/examples/asset-advanced)说明了其用法。
:::

### 加载器解析顺序
最好记住, 总是从右到左, 从下到上(独立定义)解析 `webpack` 的加载器。当您将其视为函数时, 从右到左的规则更容易记住。您可以根据此规则将定义 <mark>use: ["style-loader", "css-loader"]</mark> 解析为 <mark>style(css(input))</mark>。

要理解规则, 请参考以下示例:
```js
{
  test: /\.css$/,
  use: ["style-loader", "css-loader"],
},
```
根据从右到左的规则, 在保持等效的情况下可以拆分示例为:
```js
{
  test: /\.css$/,
  use: "style-loader",
},
{
  test: /\.css$/,
  use: "css-loader",
},
```
### 强制执行
即使可以使用上面的规则开发任意配置, 也可以方便地在常规规则之前或之后强制应用特定的规则。<mark>enforce</mark> 字段在这里可以派上用场。它可以设置为 `pre` 或 `post`, 以便在其他加载程序之前或之后执行处理。

`Linting` 是一个很好的例子, 因为构建应该在执行其他操作之前失败。使用 <mark>enforce:"post"</mark> 情况很少见, 这意味着您希望对构建的源代码执行检查。对构建的源代码执行分析是一个潜在的例子。

基本语法如下:
```js
{
  // Conditions
  test: /\.js$/,
  enforce: "pre", // "post" too

  // Actions
  use: "eslint-loader",
},
```
如果您小心地将声明与其他与测试相关的加载器链接起来, 则可以在不使用 `enforce` 的情况下编写相同的配置。而使用 `enforce` 消除了这样做的必要性, 并允许您将加载器的执行拆分为更易于组合的单独阶段。

### 将参数传递给加载器
有一种查询格式, 允许将参数传递给加载器:
```js
{
  // Conditions
  test: /\.js$/,
  include: PATHS.app,

  // Actions
  use: "babel-loader?presets[]=env",
},
```
这种类型的配置也适用于入口和源代码导入, 因为 `webpack` 会处理它。这种格式在某些个别情况下很方便, 但通常最好使用可读性更强的替代方案。

最好使用 <mark>use</mark>:
```js
{
  // Conditions
  test: /\.js$/,
  include: PATHS.app,

  // Actions
  use: {
    loader: "babel-loader",
    options: {
      presets: ["env"],
    },
  },
},
```
如果要使用多个加载器, 可以将一个数组传递到 `use` 并从那里进行扩展:
```js
{
  test: /\.js$/,
  include: PATHS.app,
  use: [
    {
      loader: "babel-loader",
      options: {
        presets: ["env"],
      },
    },
  ],
},
```

### 内联定义
即便最好使用配置级别的加载器定义, 也可以内联编写加载器定义:
```js
// Process foo.png through url-loader and other possible ones.
import "url-loader!./foo.png";

// Override possible higher level match completely
import "!!url-loader!./bar.png";
```

这种方法的问题在于它将源代码与 `webpack` 部分耦合在一起。尽管如此, 这仍然是一种可以了解的形式。

由于配置入口采用相同的机制, 因此相同的形式也可以在这里工作:
```js
{
  entry: {
    app: "babel-loader!./app",
  },
},
```

### 其他匹配文件的方法
`test` 结合 <mark>include</mark> 或 <mark>exclude</mark> 来约束匹配是最常用的文件匹配方法。它们接受下面列出的数据类型:
- `test`: 匹配 `RegExp`、字符串、函数、对象或类似的条件数组。
- `include`: 同上。
- `exclude`: 同上, 但输出与 `include` 相反。
- `resource: /inline/`: 与包含查询的资源路径匹配。如: `/path/foo.inline.js`, `/path/bar.png?inline`。
- `issuer: /bar.js/`: 根据从匹配中请求的资源进行匹配。如: 如果是从 `/path/bar.js` 请求的, 则将匹配 `/path/foo.png`。
- `resourcePath: /inline/`: 在没有查询的情况下与资源路径匹配。如: `/path/foo.inline.png`。
- `resourceQuery: /inline/`: 根据其查询与资源匹配。如: `/path/foo.png?inline`。

基于布尔的字段可以用来进一步约束这些匹配器:
- `not`: 不符合条件(请参阅参考 `test` 以获取可接受的值)
- `and`: 与一系列条件匹配。所有必须匹配。
- `or`: 与数组匹配。至少匹配一项。

### 在 use 处使用函数进行分支
在本书配置中, 您可以在更高级别上编写配置。实现类似结果的另一个选择是使用分支, 因为 `webpack` 的加载器定义允许接受您根据环境进行分支的函数。参考下面的例子:
```js
{
  test: /\.css$/,

  // `resource` refers to the resource path matched.
  // `resourceQuery` contains possible query passed to it
  // `issuer` tells about match context path
  use: ({ resource, resourceQuery, issuer }) => {
    // You have to return something falsy, object, or a
    // string (i.e., "style-loader") from here.
    //
    // Returning an array fails! Nest rules instead.
    if (env === "development") {
      return {
        use: {
          loader: "css-loader", // css-loader first
          rules: [
            "style-loader", // style-loader after
          ],
        },
      };
    }
  },
},
```

仔细应用, 这种技术允许使用不同的组合方式。

### 基于 issuer 加载
`issuer` 可用于根据导入资源的位置来控制行为。在以下改编自 [css-loader issue 287](https://github.com/webpack-contrib/css-loader/pull/287#issuecomment-261269199) 的示例中, 当 `webpack` 从 `JavaScript` 导入捕获 `css` 文件时, 将应用 `style-loader`:
```js
{
  test: /\.css$/,
  rules: [
    {
      issuer: /\.js$/,
      use: "style-loader",
    },
    {
      use: "css-loader",
    },
  ],
},
```

另一种方式是组合 `issuer` 和 `not`:
```js
{
  test: /\.css$/,
  rules: [
    { // CSS imported from other modules is added to the DOM
      issuer: { not: /\.css$/ },
      use: "style-loader",
    },
    { // Apply css-loader against CSS imports to return CSS
      use: "css-loader",
    },
  ],
}
```

### 使用 info 对象加载
如果您将函数作为 <mark>use</mark> 字段的加载器定义传递给 `webpack`, `webpack` 将提供对编译的高级访问。它希望您从调用中返回加载器:
```js
{
  rules: [
    {
      test: /\.js$/,
      include: PATHS.app,
      use: [
        (info) =>
          console.log(info) || {
            loader: "babel-loader",
            options: {
              presets: ["env"],
            },
          },
      ],
    },
  ];
}
```
如果执行此代码, 您将在控制台中看到打印内容:
```bash
{
  resource: '/webpack-demo/src/main.css',
  realResource: '/webpack-demo/src/main.css',
  resourceQuery: '',
  issuer: '',
  compiler: 'mini-css-extract-plugin /webpack-demo/node_modules/css-loader/dist/cjs.js!/webpack-demo/node_modules/postcss-loader/src/index.js??ref--4-2!/webpack-demo/node_modules/postcss-loader/src/index.js??ref--4-3!/webpack-demo/src/main.css'
}
```
该函数是一个逃生舱口, 用于进一步定制加载器。

### 基于 resourceQuery 加载
`oneOf` 字段可以根据与资源相关的匹配将 `webpack` 路由到特定的加载器:
```js
{
  test: /\.png$/,
  oneOf: [
    {
      resourceQuery: /inline/,
      use: "url-loader",
    },
    {
      resourceQuery: /external/,
      use: "file-loader",
    },
  ],
},
```
如果要将上下文信息嵌入到文件名中, 则规则可以使用 `resourcePath` 而不是 `resourceQuery`。

### 了解加载器行为
通过检查装载机的行为可以更详细地了解它们。[loader-runner](https://www.npmjs.com/package/loader-runner) 使您无需 `webpack` 即可独立运行它们。`Webpack` 在内部使用此软件包, 在[使用加载器扩展](../Extending/loaders)一章详细介绍了该软件包。

[inspect-loader](https://www.npmjs.com/package/inspect-loader) 可让您检查加载器之间传递的内容。您无需将 `console.log` 插入 `node_modules`, 您可以将此加载器附加到您的配置中并检查其中的流程。

### 结论
`Webpack` 提供了多种配置加载器的方法, 但是从 `webpack 4` 开始, 坚持 `use` 就足够了。注意加载器的顺序, 因为这是常见的问题来源。

回归一下:
- **加载器**允许您确定当 `webpack` 的模块解析机制遇到文件时应该如何处理。
- 加载器定义由要匹配的**条件**和匹配发生时应执行的**操作**组成。
- `Webpack` 提供了多种匹配和更改加载器行为的方式。例如, 您可以在匹配加载器之后根据**资源查询**进行匹配, 并将加载器路由到特定操作。

在下一章中, 您将学习使用 `webpack` 加载图片。