## 代码拆分
随着功能的不断添加, `Web` 应用程序往往会变得很大。您的网站加载时间越长, 对用户的困扰就越大。在连接速度很慢的移动环境中, 此问题会更加严重。

即使拆分捆绑包可以帮助解决问题, 但它并不是唯一的解决方案, 您仍然可能不得不下载大量数据。幸运的是, 由于代码拆分允许在需要时延迟加载代码, 所以可以做得更好。

当用户进入应用程序的新视图时, 您可以加载更多代码。您还可以将加载绑定到特定的操作, 例如滚动或单击按钮。您还可以尝试预测用户下一步要做什么, 并根据您的猜测加载代码。这样, 当用户尝试访问该功能时, 该功能将已经存在。
::: tip-zh | 
顺便说一句, 可以使用 `webpack` 的延迟加载来实现 `Google` 的 [PRPL 模式](https://developers.google.com/web/fundamentals/performance/prpl-pattern/)。`PRPL`(推送, 渲染, 预缓存, 延迟加载)在设计时考虑了移动网络。
:::
::: tip-zh | 
Philip Walton 的[闲置到紧急技术](https://philipwalton.com/articles/idle-until-urgent/)补充了代码拆分, 使您可以进一步优化应用程序加载性能。这个想法是将工作推迟到将来, 直到其有意义为止。
:::

### 代码拆分格式
可以在 `webpack` 中以两种主要方式完成代码拆分: 通过动态 `import` 或 `require.ensure` 语法。前者用于本书项目, `require.ensure` 被认为是旧式语法。

目标是最终得到一个按需加载的拆分点。拆分中可以包含其他拆分点, 并且您可以基于拆分来构建整个应用程序。这样做的好处是, 网站的初始负载可以小于其他情况。

![代码拆分](../../Build/code_splite.png)

#### 动态 import
动态 `import` 定义为 `Promise`:
```js
import(/* webpackChunkName: "optional-name" */ "./module").then(
  module => {......}
).catch(
  error => {......}
);
```