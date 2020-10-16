## 环境变量
有时代码的一部分应该只在开发期间执行。或者, 您可以在构建中具有尚未准备好投入生产的实验性功能。控制环境变量变得很有价值, 因为您可以使用它们来切换功能。

由于 `JavaScript` 压缩程序可以删除无效代码(`if(false)`), 因此您可以在此思想的基础上构建并编写转换为这种形式的代码。`Webpack` 的 `DefinePlugin` 支持替换自由变量, 因此您可以将 `if (process.env.NODE_ENV === "development")` 这种类型的代码根据环境转换为 `if (true)` 或 `if (false)`。

您可以找到依赖此行为的软件包。`React` 可能是该技术的早期采用者中最著名的例子。使用 `DefinePlugin` 可以在一定程度上降低 `React` 产品构建的大小, 并且您也可以在其他软件包中看到类似的效果。

从 `webpack 4` 开始, `process.env.NODE_ENV` 将基于给定模式在构建内进行设置, 但不会全局设置。要将变量传递给其他工具, 您必须在 `webpack` 外部或 `webpack` 配置中显式设置它。

### DefinePlugin 的基本思想
为了更好地理解 `DefinePlugin` 的概念, 请查看以下示例:
```js
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === "bar") {
  console.log("bar");
}

// Free since you don't refer to "bar", ok to replace
if (bar === "bar") {
  console.log("bar");
}
```

如果您将 `bar` 变量替换为字符串 `"foobar"`, 则最终将得到如下代码:
```js
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === "bar") {
  console.log("bar");
}

// Free since you don't refer to "bar", ok to replace
if ("foobar" === "bar") {
  console.log("bar");
}
```
进一步分析表明, `"foobar" === "bar"` === `false` 使一个压缩工具给出以下内容:
```js
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === "bar") {
  console.log("bar");
}

// Free since you don't refer to "bar", ok to replace
if (false) {
  console.log("bar");
}
```

压缩工具剔除了该 `if` 语句, 因为它已变为无效代码:
```js
var foo;

// Not free, not ok to replace
if (foo === "bar") {
  console.log("bar");
}

// if (false) means the block can be dropped entirely
```

剔除是 `DefinePlugin` 的核心思想, 它允许切换。压缩工具执行分析并切换代码的整个部分。

### 设置 process.env.NODE_ENV
和以前一样, 将此想法封装到一个函数中。由于 `webpack` 替换自由变量的方式, 您应该将其推送到 `JSON.stringify`。您最终得到一个类似的字符串 `'"demo"'`, 然后 `webpack` 将其插入它找到的插槽中:

**webpack.parts.js**
```js
exports.setFreeVariable = (key, value) => {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [new webpack.DefinePlugin(env)],
  };
};
```

将其与配置文件连接:

**webpack.config.js**
```js{3}
const commonConfig = merge([
  ......
  parts.setFreeVariable("HELLO", "hello from config"),
]);
```

最后, 添加一些替换内容:

**src/component.js**
```js{1,3}
// export default (text = "Hello world") => {

export default (text = HELLO) => {
  const element = document.createElement("div");
  ......
};
```

如果运行该应用程序, 则应该在按钮上看到一条新消息。
::: tip-zh | 
`webpack.EnvironmentPlugin(["NODE_ENV"])` 是允许您引用环境变量的快捷方式。它在 `DefinePlugin` 内部使用, 并且您可以通过传递 `process.env.NODE_ENV` 实现相同的效果。
:::
::: tip-zh | 
[dotenv-webpack](https://www.npmjs.com/package/dotenv-webpack) 更进一步, 将环境变量从点文件(`.env`)映射到内部版本使用的 `DefinePlugin`。
:::

### 用 Babel 替换自由变量
[babel-plugin-transform-inline-environment-variables](https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables) 可用于实现相同的效果。[babel-plugin-transform-define](https://www.npmjs.com/package/babel-plugin-transform-define) 和 [babel-plugin-minify-replace](https://www.npmjs.com/package/babel-plugin-minify-replace) 是 `Babel` 的其他选择。

### 选择要使用的模块
本章讨论的技术可用于根据环境选择整个模块。如上所述, 基于 `DefinePlugin` 的拆分允许您选择要使用的代码分支和要丢弃的代码分支。这种思想可以用来实现模块级的分支。请考虑以下文件结构:
```txt
.
└── store
    ├── index.js
    ├── store.dev.js
    └── store.prod.js
```

其思想是根据环境选择 `store` 的 `dev` 或 `prod` 版本。是 `index.js` 内的相关工作:
```js
if (process.env.NODE_ENV === "production") {
  module.exports = require("./store.prod");
} else {
  module.exports = require("./store.dev");
}
```
`Webpack` 可以根据 `DefinePlugin` 声明和此代码选择正确的分支。这里必须使用 `CommonJS` 模块导入, 因为 `ES2015` 的 `import` 不允许动态操作。

::: tip-zh | 
["使用软件包"](../Techniques/consuming)一章中讨论了一种相关技术, 即**别名**。
:::

::: warning-zh | 
在复杂的代码段中对 `process.env.NODE_ENV` 进行检查时必须小心。[Johnny Reilly 举了一个很好的例子来说明一个有问题的案例](https://blog.johnnyreilly.com/2018/03/its-not-dead-webpack-and-dead-code.html)。
:::

### 结论
设置环境变量是一种允许您控制源代码在构建中包含哪些路径的技术。

回顾一下:
- `Webpack` 允许您通过 `DefinePlugin` 和 `EnvironmentPlugin` 设置环境变量。后者将系统级环境变量映射到源。
- `DefinePlugin` 基于自由变量进行操作, 并在 `webpack` 分析源代码时替换它们。使用 `Babel` 插件可以获得类似的结果。
- 给定压缩工具可以剔除无效代码, 使用插件可以从生成的构建中删除代码。
- 插件支持模块级模式。通过实现包装器, 您可以选择将哪个文件包含到 `webpack` 生成的构建中。
- 除了这些插件之外, 您还可以找到其他与优化相关的插件, 这些插件可让您以多种方式控制构建结果。

为确保构建具有良好的缓存无效行为, 您将在下一章中学习将哈希值包含在生成的文件名中。这样, 客户可以注意到资产是否已更改, 并可以获取更新的版本。