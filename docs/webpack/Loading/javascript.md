## 加载 JavaScript
`Webpack` 默认处理 `ES2015` 模块定义并将其转换为代码。但是它**不会**转换特定的语法, 比如 `const`。生成的代码可能会有问题, 尤其是在老版本浏览器中。

为了更好地了解默认转换, 请考虑下面的示例输出(`npm run build--mode none`):

**dist/main.js**
```js
......
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ((text = "Hello world") => {
  const element = document.createElement("div");

  element.className = "rounded bg-red-100 border max-w-md m-4 p-4";
  element.innerHTML = text;

  return element;
});
......
```
这个问题可以通过 [Babel](https://babeljs.io/) 来解决, `Babel` 是一个著名的 `JavaScript` 编译器, 支持 `ES2015+` 等功能。它类似于 `ESLint`, 因为它构建在预设和插件之上。预设是插件的集合, 您也可以定义自己的插件。
::: tip-zh | 
`Babel` 不是唯一的选择, 尽管它是最受欢迎的选择。如果您不需要任何特定的 `Babel` 预设或插件, 则可以选择 [esbuild-loader](https://www.npmjs.com/package/esbuild-loader), [swc-loader](https://www.npmjs.com/package/swc-loader) 和 [@sucrase/webpack-loader](https://www.npmjs.com/package/@sucrase/webpack-loader)。
:::
::: tip-zh | 
鉴于有时扩展现有预设是不够的, [modify-babel-preset](https://www.npmjs.com/package/modify-babel-preset) 允许您更进一步, 以更灵活的方式配置基本预设。
:::
### 在 webpack 配置中使用 Babel
即使 `Babel` 可以独立使用, 如 *SurviveJS-Maintenance* 一书中所见, 您也可以将其与 `webpack` 一起使用。在开发过程中, 如果您使用浏览器支持的语言功能, 则可以跳过处理。

在您不依赖任何自定义语言功能并使用现代浏览器的情况下, 跳过处理是一个不错的选择。但是, 在编译生产代码时, 几乎必须通过 `Babel` 进行处理。

您可以通过 [babel-loader](https://www.npmjs.com/package/babel-loader) 将 `Babel` 与 `webpack` 一起使用。它可以选择项目级别的 `Babel` 配置, 也可以在 `webpack` 加载器本身进行配置。[babel-webpack-plugin](https://www.npmjs.com/package/babel-webpack-plugin) 是另一个鲜为人知的选项。

通过将 `Babel` 与项目连接, 您可以通过它处理 `webpack` 配置。为此, 请使用 `webpack.config.babel.js` 约定为您的 `webpack` 配置命名。[interpret](https://www.npmjs.com/package/interpret) 包启用了此功能, 并且还支持其他编译器。

::: tip-zh | 
鉴于 [Node 目前已经很好地支持 ES2015 规范](http://node.green/), 您可以使用很多 `ES2015` 功能, 而无需通过 `Babel` 处理。
:::
::: warning-zh | 
如果使用 `webpack.config.babel.js`, 请注意 `"modules": false,` 配置。如果要使用 `ES2015` 模块, 则可以跳过全局 `Babel` 配置中的设置, 然后按环境进行配置, 如下所述。
:::

### 配置 babel-loader
