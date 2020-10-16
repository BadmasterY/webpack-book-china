## 结论
正如本书所展示的, `webpack` 是一种多功能工具。为了更容易地回顾内容和概括技术要点, 请仔细阅读以下清单。

### 一般清单
- **`source map`** 允许您在开发过程中在浏览器中调试代码。可以在生产使用期间提供高质量的堆栈跟踪。["Source map"](./Building/source-maps)一章深入探讨了该主题。
- 为了保持快速构建, 请考虑进行优化。在["性能"](./Optimizing/performance)一章讨论了多种可以用来实现这一目标的方式。
- 为了使您的配置可维护, 请考虑对其进行组合。由于 `webpack` 配置是 `JavaScript` 代码, 因此可以通过多种方式进行安排。["组合配置"](./Developing/composing-configuration)一章讨论了该主题。
- `webpack` 使用软件包的方式可以自定义。在["使用软件包"](.//Techniques/consuming)一章介绍与此相关的具体技术。
- 有时您必须扩展 `webpack`。在["用加载器扩展"](./Extending/loaders)和["用插件扩展"](./Extending/plugins)章节展示了如何实现这一目标。您还可以在 `webpack` 的配置定义之上进行修改, 并根据自己的实现目标进行抽象。

### 开发清单
- 要在开发过程中充分利用 `webpack`, 请使用 `webpack-plugin-serve`(`WPS`) 或 `webpack-dev-server`(`WDS`)。您还可以找到可以在开发过程中附加到 `Node` 服务器的中间件。["开发服务器"](./Developing/development-server)一章更详细地介绍了这两者。
- `Webpack` 实现了模块热更新(`HMR`)。它使您可以自动替换模块, 而无需在应用程序运行时强制刷新浏览器。该["模块热更新"](./Appendices/hmr)附录包含详细的话题。
- 当项目越来越复杂并且正在使用多种不同的技术, 或者有多个团队从事各种功能时, 请考虑使用 ["Module Federation"](./Output/module-federation)。该方法将微服务用于前端开发, 并允许您使前端与微后端保持一致。

### 生产清单
#### Styling
- `Webpack` 默认将样式定义内联到 `JavaScript` 中。为避免这种情况, 请使用 `CSSMiniCssExtractPlugin` 或等效解决方案将 `CSS` 分离到单独的文件中。该[分离 CSS](./Styling/separating-css)章节将介绍如何实现这一点。
- 要减少要编写的 `CSS` 样式的数量, 请考虑自动加上前缀。["自动处理前缀"](./Styling/autoprefixing)一章显示了如何执行此操作。
- 基于静态分析, 可以消除未使用的 `CSS` 样式。在["清除未使用的 CSS"](./Styling/eliminating-unused-css)章节介绍了该技术的基本思想。

#### Assets
- 通过 `webpack` 加载图像时, 请对其进行优化, 以减少用户的下载量。["加载图片"](./Loading/images)一章说明了如何执行此操作。
- 根据需要支持的浏览器仅加载所需的字体。["加载字体"](./Loading/fonts)一章讨论了该主题。
- 缩小您的源文件, 以确保减少浏览器必须下载的负载。该["压缩"](./Optimizing/minifying)一章介绍如何实现这一点。

#### Caching
- 要从客户端缓存中受益, 请将第三方捆绑软件从您的应用程序中分离出来。这样, 在理想情况下, 客户端可以减少下载量。该["捆绑拆分"](./Building/bundle-splitting)一章讨论的话题。["在文件名中添加哈希"](./Optimizing/adding-hashes-to-filenames)一章显示了如何在此之上实现缓存无效。
- 使用 `webpack` 的代码拆分功能按需加载代码。如果您不需要一次性加载所有代码, 而是可以将其推到逻辑触发器(例如单击用户界面元素)之后, 则该技术很方便。该["代码拆分"](./Building/code-splitting)一章将详细介绍该技术。["动态加载"](./Techniques/dynamic-loading)一章显示了如何处理更高级的方案。
- 如["在文件名中添加哈希"](./Optimizing/adding-hashes-to-filenames)一章中所述, 将哈希添加到文件名可受益于缓存并分离运行时以进一步改善解决方案, 如["分离运行时"](./Optimizing/separating-runtime)一章中所述。

#### Optimization
- 使用 `ES2015` 模块定义来利用 `Tree shaking`。它允许 `webpack` 通过静态分析消除未使用的代码路径。有关想法, 请参见["Tree shaking"](./Optimizing/tree-shaking)一章。
- 设置特定于应用程序的环境变量以编译其生产模式。您可以通过这种方式实现功能标志。请参阅["环境变量"](./Optimizing/environment-variables)一章来概述该技术。
- 分析构建统计信息以了解需要改进的地方。在["构建分析"](./Optimizing/build-analysis)一章介绍如何做到这一点的多个可用工具。
- 将部分计算推送给 `web worker`。该["Web Workers"](./Techniques/web-workers)一章介绍如何实现这一点。

#### Output
- 清理并将有关构建的信息附加到结果中。在["整理"](./Building/tidying-up)一章展示了如何做到这一点。

### 结论
`Webpack` 允许您使用许多不同的技术来拼接构建。如本书的 `Output` 部分所述, 它支持多种输出格式。尽管名称如此, 但它不仅适用于 `web`。那是大多数人使用它的地方, 但是该工具的作用远不止于此。