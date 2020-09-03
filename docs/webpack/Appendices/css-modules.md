## CSS 模块
`CSS` 的最大问题也许是所有规则都存在于**全局作用域**内, 这意味着两个具有相同名称的类将发生冲突。该限制是 `CSS` 规范固有的, 但是项目具有解决此问题的方法。[CSS Modules](https://github.com/css-modules/css-modules) 通过在其名称中包含一个对模块全局唯一的哈希值, 使在其中声明的每个类都是唯一的, 从而为每个模块引入了**局部作用域**。

### 通过 css-loader 加载 CSS 模块
`Webpack` 的 **`css-loader`** 支持 `CSS` 模块。您可以在启用支持的同时, 通过上述加载程序定义启用它:
```js
{
  use: {
    loader: "css-loader",
    options: {
      modules: true,
    },
  },
},
```

在此更改之后, 您的 `class` 定义将作用于局部。如果需要全局 `class` 定义, 则需要将它们包装在 <mark>:global(.redButton) { ... }</mark> 声明中。

在本例中, 该 <mark>import</mark> 语句为您提供了可以绑定到元素的局部 `class`。假设您有如下 `CSS`:

**app/main.css**
```css
body {
  background: cornsilk;
}

.redButton {
  background: red;
}
```

然后, 您可以将 `class` 绑定到组件:
```js
import styles from "./main.css";

......

// Attach the generated class name
element.className = styles.redButton;
```

<mark>body</mark> 仍然作为全局。而 <mark>.redButton</mark> 并不会作用于全局。您可以用这种方式构建特定于组件的样式, 这些样式不会泄漏到其他地方。

`CSS` 模块允许组合样式, 这样更方便使用, 也可以将其与其他加载器结合, 只要在 **css-loader** 之前使用它们即可。

::: tip-zh | 
可以按照[官方文档](https://www.npmjs.com/package/css-loader#modules)中所述的那样修改 `CSS` 模块的行为。例如, 您可以修改它生成的名称。
:::

::: tip-zh | 
[eslint-plugin-css-modules](https://www.npmjs.com/package/eslint-plugin-css-modules) 方便定位 `CSS` 模块产生的问题。
:::

### 混合使用 CSS 模块和第三方 CSS 库
如果您在项目中使用 `CSS` 模块, 则应通过单独的加载程序定义处理标准 `CSS`, 而无需启用 **css-loader** <mark>modules</mark> 选项。否则, 所有类都将限于局部作用域。对于第三方库, 几乎可以肯定这不是您想要的。

您可以通过针对 <mark>node_modules</mark> 的 <mark>include</mark> 定义以不同地方式处理第三方 `CSS` 来解决该问题。或者, 您可以使用文件扩展名(<mark>.mcss</mark>)来区分使用 `CSS` 模块的文件, 然后在加载器的 <mark>test</mark> 中管理这种情况。

### 结论
`CSS` 模块通过默认为每个文件生成本地作用域来解决 `CSS` 的作用域问题。您仍然可以使用全局样式, 但这需要额外的代码。如上所述, 可以将 `webpack` 设置为支持 `CSS` 模块。