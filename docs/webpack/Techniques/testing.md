## 测试
测试是开发的重要组成部分。即使诸如 `linting` 之类的技术可以帮助发现并解决问题, 但它们也有其局限性。测试可以在许多不同级别上应用于代码和应用程​​序。

您可以对特定代码段进行**单元测试**, 也可以通过**验收测试**从用户的角度查看应用程序。**集成测试**适用于这两个极端, 并且关注单独的代码单元如何一起运行。

通常, 您不需要 `webpack` 即可运行测试。[Jest](https://jestjs.io/), [Cypress](https://www.cypress.io/) 和 [Puppeteer](https://pptr.dev/) 之类的工具很好地解决了这个问题。如果您在代码中使用 `webpack` 功能, 通常有多种方法可以适用于 `webpack` 的特定语法。

在本章中, 您将看到几种使用 `webpack` 运行测试工具的方法, 因为这仍然是使您受益于 `webpack` 特定功能的一种选择。

### Mocha
[Mocha](https://mochajs.org/) 是 `Node` 的流行测试框架。尽管 `Mocha` 提供了测试基础结构, 但您必须对其进行声明。即使 `Node` 的 [assert](https://nodejs.org/api/assert.html) 足够了, 但它也可以与其他断言库一起使用。[mocha-loader](https://www.npmjs.com/package/mocha-loader) 允许通过 `webpack` 运行 `Mocha` 测试。

#### 使用 webpack 配置 mocha-loader
首先, 将 `Mocha` 和 `mocha-loader` 安装到您的项目中:
```bash
npm add mocha mocha-loader --develop
```

#### 设置代码进行测试
要进行测试, 请添加一个用于测试的功能:

**tests/add.js**
```js
module.exports = (a, b) => a + b;
```

然后, 要进行测试, 请添加一个小型测试套件:

**tests/add.test.js**
```js
const assert = require("assert");
const add = require("./add");

describe("Demo", () => {
  it("should add correctly", () => {
    assert.equal(add(1, 1), 2);
  });
});
```

#### 配置 Mocha
要使用 `Mocha` 运行测试, 请添加脚本:

**package.json**
```json
"scripts": {
  "test:mocha": "mocha tests",
  ......
},
```

如果立即执行 `npm run test:mocha`, 应该会看到以下输出:
```bash
Demo
  should add correctly


1 passing (5ms)
```

`Mocha` 还提供了一种 `watch` 模式, 您可以通过 `npm run test:mocha -- --watch` 激活该模式。修改代码时, 它将自动运行测试套件。

::: tip-zh | 
如果您只想关注一组特定的测试, 则可使用 `--grep <pattern>` 约束行为。
:::

#### 配置 webpack
`Webpack` 可以通过 `web` 界面提供类似的功能。本书前面的章节已经解决了问题的难点。剩下的就是通过配置将这些解决方案结合起来。

要告诉 `webpack` 运行哪些测试, 需要以某种方式将其导入。["动态加载"](./dynamic-loading) 一章中讨论的 `require.context`, 允许根据规则组合文件, 用在这里非常理想。

设置入口文件如下:

**tests/index.js**
```js
// Skip execution in Node
if (module.hot) {
  const context = require.context(
    "mocha-loader!./", // Process through mocha-loader
    false, // Skip recursive processing
    /\.test.js$/ // Pick only files ending with .test.js
  );

  // Execute each test suite
  context.keys().forEach(context);
}
```

`Webpack` 配置中需要进行一些小的更改:

**webpack.mocha.js**
```js
const path = require("path");
const { merge } = require("webpack-merge");

const parts = require("./webpack.parts");

module.exports = merge([
  {
    mode: "development",
  },
  parts.devServer(),
  parts.page({
    title: "Mocha demo",
    entry: {
      tests: path.join(__dirname, "tests"),
    },
  }),
]);
```

::: tip-zh | 
有关完整配置, 请参见["组合配置"](../Developing/composing-configuration)一章中的 `devServer`。页面配置在["多页"](../Output/multiple-pages)一章中进行了说明。
:::

添加脚本以使其方便运行:

**package.json**
```json
"scripts": {
  "test:mocha:watch": "wp --config webpack.mocha.js",
  ......
},
```

::: tip-zh | 
如果您想了解为什么 `--hot` 更好, 请参阅["模块热更新"](../Appendices/hmr)附录。
:::

如果您现在执行 `npm run test:mocha:watch` 并导航到 `http://localhost:8080/`, 则应该看到测试信息:
![浏览器中的 Mocha](../../techniques/mocha.png)

调整测试或代码将导致浏览器发生变化。您可以在查看测试状态的同时增加代码规模或重构代码。

与普通的 `Mocha` 设置相比, 通过 `webpack` 配置 `Mocha` 具有以下优点:
- 可以调整模块分辨率。`Webpack` 别名和其他技术现在可以解决将代码绑定到 `webpack` 的警告。
- 您可以根据需要使用 `webpack` 的处理来编译代码。如果使用 `Mocha`, 则意味着需要进行更多设置。缺点是, 现在您需要一个浏览器来检查测试。

`mocha-loader` 最好地开发助手。通过无头浏览器运行测试可以解决该问题。

### Jest
`Facebook` 的 [Jest](https://facebook.github.io/jest/) 是一个固执己见的替代方案, 它以最小的配置封装了功能, 包括 `coverage` 和 `mocking`。它可以捕获数据的快照, 从而使其对于您想要记录和保留其行为的项目很有价值。

`Jest` 遵循 [Jasmine](https://www.npmjs.com/package/jasmine) 测试框架语义, 它支持 `Jasmine` 风格的断言。尤其是套件定义非常接近 `Mocha`, 因此当前的测试代码应该可以在无修改的情况下进测试工作。`Jest` 提供了 [jest-codemods](https://www.npmjs.com/package/jest-codemods), 用于将更复杂的项目迁移到 `Jest` 语义。

`Jest` 通过 [package.json 配置](https://facebook.github.io/jest/docs/en/configuration.html) 捕获测试。它自动在 `tests` 目录中检测测试。要捕获测试覆盖率信息, 必须在 `package.json` 中的将 `jest` 设置为 `"collectCoverage": true` 或者把 `--coverage` 标志传给 `Jest`。默认情况下, 它在 `coverage` 目录下发出 `coverage` 报告。

将一个 `webpack` 设置移植到 `Jest` 需要更多的工作, 尤其是当您依赖于 `webpack` 特定的特性时。[官方指南](https://jestjs.io/docs/en/webpack.html)涵盖了相当多的常见问题。您可以通过 [babel-jest](https://www.npmjs.com/package/babel-jest) 配置 `Jest` 来使用 `Babel`, 因为它允许您使用 `Babel` 插件(例如: [babel-plugin-module-resolver](https://www.npmjs.com/package/babel-plugin-module-resolver))来匹配 `webpack` 的功能。

### AVA
[AVA](https://www.npmjs.com/package/ava) 是设计旨在利用并行执行的测试运行程序。它具备自己的测试套件定义。[webpack-ava-recipe](https://github.com/greyepoxy/webpack-ava-recipe) 介绍了如何将其与 `webpack` 连接。

主要思想是在 `watch` 模式下运行 `webpack` 和 `AVA`, 以将处理代码的问题推送到 `webpack`, 同时允许 `AVA` 使用已处理的代码。`require.context` 与 `Mocha` 讨论的想法在这里非常有用, 因为您必须捕获 `webpack` 的测试才能以某种方式进行处理。

### 从测试中删除文件
如果通过 `webpack` 执行测试, 可能想要改变它对待图片等资源的方式。可以通过正则匹配它们, 然后使用 `noop` 函数来替换模块, 如下所示:
```js
plugins: [
  new webpack.NormalModuleReplacementPlugin(
    /\.(gif|png|scss|css)$/,
    "lodash/noop"
  ),
];
```

### Mocking
`Mocking` 是一种可以替换测试对象的技术。考虑下面的解决方案:

- [Sinon](https://www.npmjs.com/package/sinon) 提供 `mocks`, `stubs` 和 `spies`。`Sinon` 与 `webpack` 一起运行良好。
- [inject-loader](https://www.npmjs.com/package/inject-loader) 允许通过依赖关系将代码注入到模块中, 这使得它对于 `mocking` 很有价值。
- [webpack-inject-plugin](https://www.npmjs.com/package/webpack-inject-plugin) 用于在捆绑级别注入代码的插件。

### 结论
可以将 `webpack` 配置与多种测试工具一起使用。每种工具都有其优点, 但是它们也有很多共同点。

回顾一下:
- 运行测试工具使您可以受益于 `webpack` 的模块解析机制。
- 有时测试设置可能会涉及很多样板。像 `Jest` 这样的工具可以删除大部分样板, 并允许您以最少的配置来开发测试。
- 您可以找到多个用于 `webpack` 的 `mocking` 工具。它们使您能够创建测试环境。但是, 有时您可以通过设计避免 `mocking`。

在下一章中, 您将学习使用 `webpack` 部署应用程序。