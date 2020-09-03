## 模块热更新
模块热更新(`HMR`)建立在 `WDS` 之上。它启用了一个接口, 可以实时交换模块。例如, 样式加载器可以在不强制刷新的情况下更新 `CSS`。为样式实现 `HMR` 是理想的, 因为 `CSS` 在设计上是无状态的。

在 `JavaScript` 也可以使用 `HMR`, 但是由于应用程序状态, 因此它更加难以实现。[react-refresh-webpack-plugin](https://www.npmjs.com/package/react-refresh-webpack-plugin) 和 [vue-hot-reload-api](https://www.npmjs.com/package/vue-hot-reload-api) 是很好的例子。

::: tip-zh | 
鉴于 `HMR` 实现起来可能很复杂, 一个不错的折衷方案是将应用程序状态存储到 <mark>localStorage</mark>, 刷新后根据该状态对应用程序进行补充。这样做会将问题推到应用程序端。
:::

### 启用 HMR
要启用 `HMR`, 需要启用以下步骤:

- 开发服务器必须在 <mark>hot</mark> 模式下运行, 才能将热模块替换界面公开给客户端。
- `Webpack` 必须提供服务器的热更新, 可以使用 <mark>webpack.HotModuleReplacementPlugin</mark> 来实现。
- 客户端必须运行开发服务器提供的特定脚本。它们将自动注入, 但可以通过入口配置显式启用。
- 客户端必须通过 <mark>module.hot.accept</mark> 来实现 `HMR` 接口, 并有选择 <mark>module.hot.dispose</mark> 清理模块, 然后才可以进行替换。

使用 <mark>webpack-dev-server --hot</mark> 或在 <mark>hot</mark> 模式下运行 **webpack-plugin-servehot** 可解决前两个问题。在这种情况下, 如果要更新 `JavaScript` 应用程序代码, 则只需自己处理最后一个。跳过 <mark>--hot</mark> 标志并进行 `webpack` 配置可具备更高的灵活性。

以下清单包含与此方法有关的基本部分。您必须从此处进行调整以匹配您的配置样式:
```js
{
  devServer: {
    // Don't refresh if hot loading fails. Good while
    // implementing the client interface.
    hotOnly: true,

    // If you want to refresh on errors too, set
    // hot: true,
  },
  plugins: [
    // Enable the plugin to let webpack communicate changes
    // to WDS. --hot sets this automatically!
    new webpack.HotModuleReplacementPlugin(),
  ],
}
```

如果在不实现客户端接口的情况下实现上述配置, 则很可能会出现错误:  
![不刷新](../../hmr/hmr_error.png)

该消息表明, `HMR` 接口已向客户端部分通知了热更新代码, 但是未对其进行任何处理, 而这是下一步需要解决的问题。

::: tip-zh | 
假定您已设置 <mark>optimization.moduleIds = 'named'</mark>。如果您在 <mark>development</mark> 模式下运行 `webpack`, 默认情况下它将处于打开状态。
:::

::: warning-zh | 
您**不应该**为您的生产配置启用 `HMR`。它可能有效, 但会使您的捆绑包超出其应有的大小。
:::

::: warning-zh | 
如果您使用的是 `Babel`, 请对其进行配置, 允许生成 `Webpack` 控制模块, 否则 `HMR` 逻辑将无法工作! 有关确切设置, 请参见["加载JavaScript"]()一章。
:::

### 实现 HMR 接口
`Webpack` 通过全局变量 <mark>module.hot</mark> 公开 `HMR` 接口。它通过 <mark>module.hot.accept(&lt;path to watch&gt;, &lt;handler&gt;)</mark> 功能提供更新, 您需要在那里更新应用程序。

以下实现体现了教程应用程序的思路:

**src/index.js**
```js
import component from "./component";

let demoComponent = component();

document.body.appendChild(demoComponent);

// HMR interface
if (module.hot) {
  // Capture hot update
  module.hot.accept("./component", () => {
    const nextComponent = component();

    // Replace old content with the hot loaded one
    document.body.replaceChild(nextComponent, demoComponent);

    demoComponent = nextComponent;
  });
}
```
如果刷新浏览器, 请尝试在此更改后进行修改 <mark>src/component.js</mark>, 然后将文本更改为其他内容, 您应注意到浏览器根本不刷新。相反, 它只是替换 `DOM` 节点, 同时保留应用程序的其余部分。

::: tip-zh | 
<mark>module.hot.accept</mark> 也可以使用文件名数组。处理程序(第二个参数)是可选的。
:::

下图显示了可能的输出:  
![通过HMR成功更新了模块](../../hmr/hmr_success.png)

这个想法与 `style`、`React`、`Redux` 和其他技术是一样的。有时, 您不必自己实现接口, 可用的工具会为您处理这些问题。

::: tip-zh | 
为了证明 `HMR` 保留了应用程序状态, 请在原始文件旁边设置一个基于[复选框](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox)的组件。该 <mark>module.hot.accept</mark> 代码也必须修改以捕获对其所做的更改。
:::

::: tip-zh | 
当 `minifier` 碰到 <mark>if(module.hot)</mark> 代码块时, 该块将从生产构建中剔除。["代码压缩"]()一章中深入探讨该问题。
:::

::: tip-zh | 
[hot-accept-webpack-plugin](https://www.npmjs.com/package/hot-accept-webpack-plugin) 和 [module-hot-accept-loader](https://www.npmjs.com/package/module-hot-accept-loader) 允许您为匹配的每个模块编写 <mark>if (module.hot) { module.hot.accept(); }</mark>。如果您的模块应该接受热加载而不实现更新行为, 这将很有用。
:::

::: tip-zh | 
[Stanimira Vlaeva 深入研究"模块热更新"](https://nativescript.org/blog/deep-dive-into-hot-module-replacement-with-webpack-part-two-handling-updates/)将更详细地讨论该主题。
:::

### 手动设置 WDS 入口
在上面的设置中, 与 `WDS` 相关的入口被自动注入。假设您正在通过 `Node` 使用 `WDS`, 则必须自行设置它们, 因为 `Node API` 不支持注入。下面的示例说明了如何实现此目的:
```js
entry: {
  hmr: [
    // Include the client code. Note host/post.
    "webpack-dev-server/client?http://localhost:8080",

    // Hot reload only when compiled successfully
    "webpack/hot/only-dev-server",

    // Alternative with refresh on failure
    // "webpack/hot/dev-server",
  ],
  ......
},
```

### HMR 与动态加载
通过 <mark>require.context</mark> 和 `HMR` 进行[动态加载]()需要额外的操作:
```js
const req = require.context("./pages", true, /^(.*\.(jsx$))[^.]*$/g);

module.hot.accept(req.id, ......); // Replace modules here as above
```

### 结论
`HMR` 是 `webpack` 吸引开发人员的一个方面, `webpack` 的实现也取得了很大进展。如果要启用 `HMR`, 需要客户端和服务器端支持。为此, `webpack-dev-server` 提供这两种功能。不过您必须注意客户端, 要么找到实现 `HMR` 接口的解决方案, 要么自己实现它。