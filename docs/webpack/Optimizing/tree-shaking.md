## Tree shaking
**`Tree shaking`** 是 `ES2015` 模块定义启用的功能。其思想是, 如果可以在不运行模块的情况下静态地分析模块定义, `webpack` 可以判断出代码的哪些部分正在被使用, 哪些部分没有被使用。可以通过扩展应用程序并添加应该剔除的代码来验证这种行为。

从 `webpack 5` 开始, `tree shaking` 得到了改进, 它可以在以前不起作用的情况下工作, 包括嵌套和 `CommonJS`。

> 译者注: `Tree shaking` 的核心思想就是通过静态分析, 剔除未使用/永远不会执行的代码。参考摇晃苹果树, 获取苹果的操作。

### 演示 tree shaking
要进行演示, 您必须定义一个模块并仅使用其代码的一部分:

**src/shake.js**
```js
const shake = () => console.log("shake");
const bake = () => console.log("bake");

export { shake, bake };
```

为了确保使用部分代码, 请修改 `index.js` 文件:

**src/index.js**
```js
......
import { bake } from "./shake";

bake();
```

如果您再次构建项目(`npm run build`)并检查构建(`dist/main.js`), 则该项目应包含 `console.log("bake")`, 但会丢失 `console.log("shake")`。那证明 `tree shaking` 正常工作。

要更好地了解 `webpack` 用于 `tree shaking` 的过程, 请运行 `npm run build -- --display-used-exports`。您应该在终端中看到类似 `[no exports used]` 或的其他输出 `[only some exports used: bake]`。

::: tip-zh | 
如果您使用的是 **`terser-webpack-plugin`**, 请启用警告以达到类似效果。除了其他消息外, 您还应该看到类似的消息 `Dropping unused variable treeShakingDemo [./src/component.js:17,6]`。
:::
::: warning-zh | 
要使 `tree shaking` 与 `TypeScript` 一起使用, 必须将设置 `compilerOptions.module` 为 `es2015` 或其他等效配置。想法是保留 `ES2015` 模块定义以供 `webpack` 处理, 因为它具备需要用于 `tree shaking` 的信息。
:::

### 软件包级别的 tree shaking
同样的想法也适用于使用 `ES2015` 模块定义的依赖项。考虑到相关的软件包, 标准仍在不断定制, 您在使用此类软件包时必须小心。`Webpack` 尝试解析 `pakcage.json` `module` 字段。

对于像 `webpack` 这样的工具, 允许 `tree shaking` `npm` 包, 您应该生成一个构建, 该构建将除 `ES2015` 模块定义之外的所有其他内容都转换, 然后通过 `package.json` `module` 字段指向它。在 `Babel` 术语中, 您必须让 `webpack` 通过配置 `"modules": false` 来管理 `ES2015` 模块。

另一个重要的点是设置 `"sideEffects": false` 表示在代码执行时, 它不会修改其自身范围之外的任何内容。如果您想更具体一些, 该属性还接受一个文件路径数组。[与此相关的 `StackOverflow` 问题详细解释了原因](https://stackoverflow.com/questions/49160752/what-does-webpack-4-expect-from-a-package-with-sideeffects-false)。

### 外部软件包 tree shaking
为了最大限度地利用外部软件包进行 `tree shaking`, 您必须使用 [babel-plugin-transform-imports](https://www.npmjs.com/package/babel-plugin-transform-imports) 重写 `import`, 以便它们与 `webpack` 的 `tree shaking` 逻辑配合使用。有关更多信息, 请参见 [webpack issue 2867](https://github.com/webpack/webpack/issues/2867)。

通过设置带有 `test: path.resolve(__dirname, "node_modules/package")` 和 `"sideEffects": false` 字段的加载器定义, 可以在 `webpack` 配置中强制设置 `"sideEffects": false`。

::: tip-zh | 
[SurviveJS - Maintenance](https://survivejs.com/maintenance/packaging/building/) 在软件包的角度深入探讨这个主题。
:::

### 结论
`Tree shaking` 是一种潜在的强大技术。为了让源代码从 `tree shaking` 中获益, `npm` 包必须使用 `ES2015` 模块语法实现, 并且必须通过 `webpack` 等工具的 `package.json` `module` 字段公开 `ES2015` 版本。

回顾一下:
- **`Tree shaking`** 会基于静态代码分析丢弃未使用的代码段。`Webpack` 在遍历依赖关系图时为您执行此过程。
- 要从 `tree shaking` 中受益, 您必须使用 `ES2015` 模块定义。
- 作为软件包的作者, 您可以提供包含 `ES2015` 模块的软件包版本, 而其余版本已转换为 `ES5`。设置 `"sideEffects": false` 很重要, 如此设置之后 `Webpack` 知道对动软件包使用 `tree shaking` 是安全的。

在下一章中, 您将学习如何使用 `webpack` 管理环境变量。