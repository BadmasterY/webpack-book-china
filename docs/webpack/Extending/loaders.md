## 用加载器扩展
到目前为止, 正如您所见的那样, 加载器是 `webpack` 的组成部分之一。如果要加载资源, 则很可能需要设置匹配的加载器定义。即使有[很多可用的加载器](https://webpack.js.org/loaders/), 但依旧有可能找不到任何适用于当前项目的加载器。

接下来, 您将学习开发几个小型加载器。但是在此之前, 最好了解如何单独调试它们。

::: tip-zh | 
如果您想为加载器或插件提供好的起点, 请考虑使用 [webpack-defaults](https://github.com/webpack-contrib/webpack-defaults), 它为 `linting`、测试和其他好的工具提供了基本的起点。
:::

### 使用 loader-runner 调试加载器
[loader-runner](https://www.npmjs.com/package/loader-runner) 允许您在没有 `webpack` 的情况下运行加载器, 从而使您可以了解有关加载器开发的更多信息。首先进行安装:
```bash
npm add loader-runner --develop
```

若要进行测试, 需要设置一个加载器, 该加载器返回传递给它的值的两倍:  
**loaders/demo-loader.js**
```js
module.exports = (input) => input + input;
```

设置要处理的文件:  
**demo.txt**
```txt
foobar
```

代码中还没有特定于 `webpack` 的东西。下一步是通过 **`loader-runner`** 运行加载器:  
**run-loader.js**
```js
const fs = require("fs");
const path = require("path");
const { runLoaders } = require("loader-runner");

runLoaders(
  {
    resource: "./demo.txt",
    loaders: [path.resolve(__dirname, "./loaders/demo-loader")],
    readResource: fs.readFile.bind(fs),
  },
  (err, result) => (err ? console.error(err) : console.log(result))
);
```

如果现在运行脚本(`node run-loader.js`), 应该会看到输出:
```bash
{
  result: [ 'foobar\nfoobar\n' ],
  resourceBuffer: <Buffer 66 6f 6f 62 61 72 0a>,
  cacheable: true,
  fileDependencies: [ './demo.txt' ],
  contextDependencies: [],
  missingDependencies: []
}
```
> **BTW**: `result` 内的 `\n` 为尾部换行导致。如果不换行:  
> result: [ 'foobarfoobar' ]  
> resourceBuffer: <Buffer 66 6f 6f 62 61 72>  
> ......

输出告诉处理的 `result`、作为缓冲区处理的资源和其他元信息。这些数据足以开发出更复杂的加载器。

::: tip-zh | 
如果要将输出写入文件, 请使用 `fs.writeFileSync("./output.txt", result.result)` 或其异步版本, 如 [Node 文档中所述](https://nodejs.org/api/fs.html)。
:::
::: tip-zh | 
可以通过名称引用安装到本地项目的加载器, 而不用解析它们的完整路径。例如: `loaders: ["raw-loader"]`。
:::

### 实现异步加载器
即使您可以使用同步接口实现许多加载器, 但有时仍需要进行异步计算。将第三方软件包包装为加载器时, 可能会迫使您这样做。

通过使用 `webpack` 特定的 `API` <mark>this.async()</mark>, 可以将上述示例调整为异步形式。`Webpack` 对 `this` 进行设置, 然后函数按照 `Node` 约定返回一个回调函数(错误优先)。

进行如下调整:  
**loaders/demo-loader.js**
```js
module.exports = function (input) {
  const callback = this.async();

  // No callback -> return synchronous results
  // if (callback) { ... }

  callback(null, input + input);
};
```
::: warning-zh | 
鉴于 `webpack` 通过 `API` 为其注入其 `this`, 所以此处不能使用箭头函数(`() => ...`)。
:::
::: tip-zh | 
如果要将 `source map` 传递到 `webpack`, 请将其作为回调的第三个参数。
:::

再次运行演示脚本(`node run-loader.js`), 其结果应与之前相同。要在执行期间引发错误, 请尝试以下操作:  
**loaders/demo-loader.js**
```js
module.exports = function (input) {
  const callback = this.async();

  callback(new Error("Demo error"));
};
```

结果应包含 `Error: Demo error` 相关的堆栈跟踪信息, 以显示错误产生的位置。

### 仅返回输出
加载器也可用于仅返回输出。代码实现如下:  
**loaders/demo-loader.js**
```js
module.exports = () => "foobar";
```

但有什么意义呢? 您可以通过 `webpack` 入口传递给加载器。在大多数情况下, 入口都是指向一些已经存在的文件, 而这种方式使您可以动态生成代码的加载器。

::: tip-zh | 
如果要返回 `Buffer` 输出, 请设置 `module.exports.raw = true`。该标志将覆盖默认返回一个字符串的行为。
:::

### 写文件
诸如 **`file-loader`** 之类的加载器会产出文件。`Webpack` 为此提供了一种方法 `this.emitFile`。鉴于 `loader-runner` 没有实现该方法, 您必须对其进行模拟:  
**run-loader.js**
```js{6-8}
runLoaders(
  {
    resource: "./demo.txt",
    loaders: [path.resolve(__dirname, "./loaders/demo-loader")],

    context: {
      emitFile: () => {},
    },

    readResource: fs.readFile.bind(fs),
  },
  (err, result) => (err ? console.error(err) : console.log(result))
);
```

要实现 **`file-loader`** 的基本思想, 您必须做两件事: 产出文件并返回文件的路径。

要插入文件名, 需要使用 [loader-utils](https://www.npmjs.com/package/loader-utils)。它还具有解析加载程序选项和查询功能的实用程序。安装它:
```bash
npm add loader-utils --develop
```

您可以应用以下逻辑:  
**loaders/demo-loader.js**
```js
const loaderUtils = require("loader-utils");

module.exports = function (content) {
  const url = loaderUtils.interpolateName(this, "[hash].[ext]", {
    content,
  });

  this.emitFile(url, content);

  const path = `__webpack_public_path__ + ${JSON.stringify(url)};`;

  return `export default ${path}`;
};
```
`Webpack` 提供了两种额外的 `emit` 方法:
- `this.emitWarning(<string>)`
- `this.emitError(<string>)`

我们也可以使用 `console` 中的相关方法来替代它们。与 `this.emitFile` 一样, 您必须模拟它们才能在 `loader-runner` 中工作。

下一个问题是如何将文件名传递给加载器。

::: tip-zh | 
`loader-utils` 包含插入文件名之外的实用程序。一个很好的例子是 `loaderUtils.parseQuery(this.resourceQuery)`, 它允许您解析传递给加载程序的查询参数, 并以另一种方式控制它的行为。
:::

### 将 options 传递给加载器
为了演示如何传递 `options`, 需要做一些小调整:  
**run-loader.js**
```js{9-17}
const fs = require("fs");
const path = require("path");
const { runLoaders } = require("loader-runner");

runLoaders(
  {
    resource: "./demo.txt",

    // loaders: [path.resolve(__dirname, "./loaders/demo-loader")],
    loaders: [
      {
        loader: path.resolve(__dirname, "./loaders/demo-loader"),
        options: {
          name: "demo.[ext]",
        },
      },
    ],

    context: {
      emitFile: () => {},
    },
    readResource: fs.readFile.bind(fs),
  },
  (err, result) => (err ? console.error(err) : console.log(result))
);
```

要将其连接到加载器, 请将其设置为捕获 `name` 并通过 `webpack` 的插值器传递:  
**loaders/demo-loader.js**
```js{5-7,9-10}
const loaderUtils = require("loader-utils");

module.exports = function(content) {

  // const url = loaderUtils.interpolateName(this, "[hash].[ext]", {
  //   content,
  // });

  const { name } = loaderUtils.getOptions(this);
  const url = loaderUtils.interpolateName(this, name, { content });
  ......
};
```
运行(`node ./run-loader.js`)后, 您应该会看到以下内容:
```bash
{ result: [ 'export default __webpack_public_path__+"demo.txt";' ],
  resourceBuffer: <Buffer 66 6f 6f 62 61 72 0a>,
  cacheable: true,
  fileDependencies: [ './demo.txt' ],
  contextDependencies: [] }
```

您可以看到结果与加载器应返回的结果匹配。您可以尝试将更多选项传递给加载器, 或使用查询参数来查看不同组合会发生什么。

::: tip-zh | 
验证选项是个好主意, 如果选项不是您所期望的, 那么就不应该默默地失败。[schema-utils](https://www.npmjs.com/package/schema-utils) 就是为此目的而设计的。
:::

### 将自定义加载器与 webpack 连接
为了充分利用加载器, 您必须将它们与 `webpack` 连接。为此, 可以使用 `import`:  
**src/component.js**
```js
import "!../loaders/demo-loader?name=foo!./main.css";
```

鉴于定义过于冗长, 因此可以使用以下别名作为加载器的别名:  
**webpack.config.js**
```js{5-12}
const commonConfig = merge([
  {
  ......

    resolveLoader: {
      alias: {
        "demo-loader": path.resolve(
          __dirname,
          "loaders/demo-loader.js"
        ),
      },
    },

  },
  ......
]);
```

通过此更改, 可以简化 `import` 定义:
```js
// import "!../loaders/demo-loader?name=foo!./main.css";

import "!demo-loader?name=foo!./main.css";
```

您还可以通过 `rules` 来处理加载器定义。一旦加载器足够稳定, 就可以基于 `webpack-defaults` 设置一个项目, 然后将加载器逻辑添加在其中, 然后将加载器作为软件包使用。

::: warning-zh | 
尽管使用 `loader-runner` 可以方便地开发和测试加载器, 但是请实施针对 `webpack` 进行集成测试。环境之间的细微差异使这一点变得至关重要。
:::

### Pitch loaders
![Webpack 加载程序处理](../../extending/pitch-loaders.webp)

`Webpack` 评估分为两个阶段: `pitching` 和 `evaluating`。如果您习惯于 `web` 事件语义, 那么这些将映射为捕获和冒泡。这个想法是,  `webpack` 允许你在 `pitching`(捕捉)阶段拦截执行。它首先从左到右遍历加载器, 然后从右到左执行它们。

`pitch loader` 使您可以调整请求甚至终止请求。设置它:  
**loaders/pitch-loader.js**
```js
const loaderUtils = require("loader-utils");

module.exports = function (input) {
  return input + loaderUtils.getOptions(this).text;
};
module.exports.pitch = function (
  remainingReq,
  precedingReq,
  input
) {
  console.log(`
Remaining request: ${remainingReq}
Preceding request: ${precedingReq}
Input: ${JSON.stringify(input, null, 2)}
  `);

  return "pitched";
};
```

要将其连接到 `run-loader.js`, 请将其添加到 `loader` 定义中。修改如下:  
**run-loader.js**
```js{7}
runLoaders(
  {
    resource: "./demo.txt",
    loaders: [
      ......

      path.resolve(__dirname, "./loaders/pitch-loader"),

    ],
    ......
  },
  (err, result) => (err ? console.error(err) : console.log(result))
);
```

如果您现在运行(`node ./run-loader.js`), 则 `pitch loader` 应记录中间数据并拦截执行:
```bash
Remaining request: ./demo.txt
Preceding request: .../webpack-demo/loaders/demo-loader?{"name":"demo.[ext]"}
Input: {}

{ result: [ 'export default __webpack_public_path__ + "demo.txt";' ],
  resourceBuffer: null,
  cacheable: true,
  fileDependencies: [],
  contextDependencies: [] }
```

::: tip-zh | 
在[官方文档](https://webpack.js.org/api/loaders/)详细地介绍了加载器 `API`。您可以在那里查看所有 `this` 可用字段。例如, `mode` 是公开的。
:::

### 用加载器缓存
尽管 `webpack` 默认情况下会缓存加载器, 除非设置了 `this.cacheable(false)`, 但编写缓存加载器可能是一个不错的练习, 因为它可以帮助您了解加载器阶段如何协同工作。下面的示例显示了如何实现这一目标(由 Vladimir Grenaderov 提供):
```js
const cache = new Map();

module.exports = function (content) {
  // Calls only once for given resourcePath
  const callbacks = cache.get(this.resourcePath);
  callbacks.forEach((callback) => callback(null, content));
  cache.set(this.resourcePath, content);

  return content;
};
module.exports.pitch = function () {
  if (cache.has(this.resourcePath)) {
    const item = cache.get(this.resourcePath);

    if (item instanceof Array) {
      item.push(this.async()); // Load to cache
    } else {
      return item; // Hit cache
    }
  } else {
    cache.set(this.resourcePath, []); // Missed cache
  }
};
```

可以使用 `pitch loader` 将元数据附加到输入以供以后使用。在这个例子中, 缓存是在提交阶段构建的, 并且在正常执行期间被访问。

### 结论
编写加载程序很有趣, 因为它们描述了从一种格式到另一种格式的转换。通常, 您可以通过研究 `API` 文档或现有的加载程序来弄清楚如何实现特定的功能。

回顾一下:
- `loader-runner` 是了解加载器工作方式的宝贵工具。用它来调试加载器的工作方式。
- `Webpack` 加载器接受输入并根据输入产生输出。
- 加载器可以是同步的也可以是异步的。在后一种情况下, 您应该使用 `webpack API` `this.async()` 来捕获 `webpack` 公开的回调。
- 如果要为 `webpack` 入口动态生成代码, 则可以在其中使用加载器。加载器不必接受输入。在这种情况下只返回输出是可以接受的。
- 使用 `loader-utils` 解析传递给加载器的可能选项, 并考虑使用 `schema-utils` 对其进行验证。
- 在本地开发装载程序时, 请考虑设置 `aresolveLoader.alias` 来清理引用。
- `pitching` 阶段是对默认行为的补充, 它允许您截取和附加元数据。

在下一章中, 您将学习编写插件。插件允许您拦截 `webpack` 的执行过程, 并且可以与加载程序结合使用以开发更多高级功能。