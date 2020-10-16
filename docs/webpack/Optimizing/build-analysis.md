## 构建分析
分析构建统计信息是迈向更好地了解 `webpack` 的好方法。可用的工具有助于回答以下问题:
- 项目包的组成是什么？
- 项目模块具有什么样的依赖关系？
- 项目规模如何随着时间变化？
- 可以安全删除哪些项目模块？
- 哪些项目模块重复？
- 为什么将特定的模块包含在项目包中？

### 配置 webpack
为了使 `webpack` 产出分析信息, 您应该配置 `--json` 标志并将输出通过管道(`pipeline`)传递到文件, 如下所示:

**package.json**
```json
"scripts": {
  "build:stats": "wp --mode production --json > stats.json",
  ......
},
```

无论您的 `webpack` 配置如何, 以上是您所需的基本设置。立即执行 `npm run build:stats`。一段时间后, 您应该在项目根目录中找到 *`stats.json`*。可以通过各种工具推送此文件, 以更好地了解正在发生的事情。

您还可以考虑使用以下标志:
- `--profile` 捕获与时序有关的信息。该设置是可选的, 但易于设置。
- `--progress` 以显示 `webpack` 在构建的不同阶段花费了多长时间。

#### Node API
可以通过 `Node` 捕获统计信息。由于统计信息可能包含错误, 因此最好单独处理这种情况:
```js
const webpack = require("webpack");
const config = require("./webpack.config.js")("production");

webpack(config, (err, stats) => {
  if (err) {
    return console.error(err);
  }

  if (stats.hasErrors()) {
    return console.error(stats.toString("errors-only"));
  }

  console.log(stats);
});
```
如果您想对统计数据进行进一步的处理, 这种技术可能很有价值, 尽管通常其他解决方案就足够了。
::: tip-zh | 
如果要从 `stats` 输出 `JSON`, 请使用 `stats.toJson()`。要获取详细的输出, 请使用 `stats.toJson("verbose")`。它遵循 `webpack` 支持的所有统计信息选项。
:::
::: tip-zh | 
要模拟该 `--json` 标志, 请使用 `console.log(JSON.stringify(stats.toJson(), null, 2));`。输出被格式化为可读的形式。
:::

#### webpack-stats-plugin 和 webpack-bundle-tracker
如果要通过插件管理统计信息, 请查看 [webpack-stats-plugin](https://www.npmjs.com/package/webpack-stats-plugin)。它使您可以控制输出, 并可以在写入之前对其进行转换。您可以使用它从输出中排除特定的依赖项。

[webpack-bundle-tracker](https://www.npmjs.com/package/webpack-bundle-tracker) 可以在 `webpack` 编译时捕获数据。为此, 它使用 `JSON`。

### 启用性能预算
`Webpack` 允许您定义性能预算。这个想法是它给您的构建进行大小限制, 它必须遵循该限制。该功能默认情况下处于禁用状态, 并且计算包括要计算的入口块。

要将功能集成到项目中, 请如下调整配置:

**webpack.config.js**
```js{2-8}
const productionConfig = merge([
  {
    performance: {
      hints: "warning", // "error" or false are valid too
      maxEntrypointSize: 50000, // in bytes, default 250k
      maxAssetSize: 100000, // in bytes
    },
  },
  ......
]);
```
如果您的项目超出限制, 您应该看到类似以下的警告:
```bash
WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (48.8 KiB). This can impact web performance.
  Entrypoints:
    main (143 KiB)
        runtime.6ed3.js
        728.7dfb.js
        main.be03.css
        main.2629.js
```

如果要在 `CI` 环境中实施严格限制, 请设置 `hints` 为 `error`。这样做会导致构建失败, 并迫使开发人员修改限制或就良好限制进行讨论。

### 依赖性分析
可以以图形方式分析包依赖关系, 并且为此目的存在许多工具。

#### 官方分析工具
![官方分析工具](../../optimiz/official_tool.webp)

[官方分析工具](https://github.com/webpack/analyse)会为您提供建议, 并为您的应用程序的依赖关系图提供一个好主意。它也可以在本地运行。

#### webpack-xray
[webpack-xray](https://github.com/akx/webpack-xray) 与官方分析工具相似, 同时具有现代化的 `UI` 并支持对数据的追溯。

#### Stellar Webpack
![Stellar Webpack](../../optimiz/stellar_webpack.webp)

[Stellar Webpack](https://alexkuz.github.io/stellar-webpack/) 提供基于 `Universe` 的可视化界面, 并允许您以 `3D` 形式检查应用程序。

#### webpack-deps-tree
[webpack-deps-tree](https://restrry.github.io/webpack-deps-tree/static/) 显示 `webpack` 模块图。使用该工具, 您可以了解捆绑软件的模块之间如何相互关联。

#### circular-dependency-plugin
[circular-dependency-plugin](https://www.npmjs.com/package/circular-dependency-plugin) 可让您检测模块图中的循环。通常, 这意味着存在错误, 并且重构循环可能是一个好主意。

#### dependency-cruiser
[dependency-cruiser](https://www.npmjs.com/package/dependency-cruiser) 是用于分析项目依赖关系的独立于捆绑程序的工具。

#### madge
![madge](../../optimiz/madge.webp)

[madge](https://www.npmjs.com/package/madge) 是另一个可以根据模块输入进行图形输出的独立工具。图形输出使您可以更详细地了解项目的依赖关系。

### 成分分析
饼图, 树形图和命令行工具可让您可视化捆绑包的组成。研究生成的图形可以有效了解整个捆绑包的组成, 并了解是什么影响的捆绑包大小。

#### 饼状图
![webpack 可视化工具](../../optimiz/pie_charts.webp)

[Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) 提供了一个饼状图, 显示了包的组成, 从而可以了解哪些依赖项会影响整体结果的大小。[Webpack Chart](https://alexkuz.github.io/webpack-chart/) 是另一个类似的选项。

除了提供饼图可视化之外, [Auxpack](http://auxpack.com/) 还可以跟踪随时间变化的捆绑包大小。

#### 树状图
![webpack-bundle-analyzer](../../optimiz/webpack_bundle_analyzer.webp)

[webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) 提供了可缩放的树状图。

[Webpack Monitor](http://webpackmonitor.com/) 是另一个类似的工具, 其重点是清晰的用户界面。能够提供有关改进构建的建议。

[source-map-explorer](https://www.npmjs.com/package/source-map-explorer) 是一个独立于 `webpack` 的工具。它使您可以使用源映射来深入了解自己的构建。它提供了一个基于树形图的可视化效果, 显示了哪些代码有助于结果。[bundle-wizard](https://www.npmjs.com/package/bundle-wizard) 是另一个类似的工具。

#### 命令行程序
[webpack-bundle-size-analyzer](https://www.npmjs.com/package/webpack-bundle-size-analyzer) 提供了基于文本的组成展示。

```bash
$ webpack-bundle-size-analyzer stats.json
react: 93.99 KB (74.9%)
purecss: 15.56 KB (12.4%)
style-loader: 6.99 KB (5.57%)
fbjs: 5.02 KB (4.00%)
object-assign: 1.95 KB (1.55%)
css-loader: 1.47 KB (1.17%)
<self>: 572 B (0.445%)
```

### 在线服务
通过使用 [Bundle Analyzer](https://www.bundle-analyzer.com/)(免费)和 [Packtracker](https://packtracker.io/)(商业), 可以将 `bundle` 分析集成到您的构建过程中。该服务与 `GitHub` 集成良好, 并将显示在您的拉取请求中, 因为在此可见信息非常有价值。

### 捆绑包比较
[@mixer/webpack-bundle-compare](https://www.npmjs.com/package/@mixer/webpack-bundle-compare) 允许您通过用户界面比较随时间变化的包大小。

[webpack-bundle-diff](https://github.com/smikula/webpack-bundle-diff) 在较低级别上运行, 并发出带有差异的 `JSON` 文件。它与自定义可视化效果很好。

[size-plugin](https://github.com/GoogleChromeLabs/size-plugin) 打印出自上次构建以来的大小差异, 这在本地开发中可能很有用。

### 未使用文件分析
[unused-webpack-plugin](https://www.npmjs.com/package/unused-webpack-plugin) 能够发现 `webpack` 构建未使用但包含在项目中的文件。[remnants](https://www.npmjs.com/package/remnants) 是一个超越 `webpack` 的解决方案, 也可以与其他工具一起使用。

### 重复分析
除了 `inspectpack` 外, 还有其他工具可以找出重复项:
- [bundle-duplicates-plugin](https://www.npmjs.com/package/bundle-duplicates-plugin) 在功能级别上运行。
- [find-duplicate-dependencies](https://www.npmjs.com/package/find-duplicate-dependencies) 在 `npm` 软件包级别上实现了相同的目的。
- [depcheck](https://www.npmjs.com/package/depcheck) 会走得更远, 并在项目中存在冗余依赖项或缺少依赖项时发出警告。
- [bundle-buddy](https://www.npmjs.com/package/bundle-buddy) 可以在捆绑之间找到重复项, 同时提供用户界面来调整 `webpack` 代码拆分行为。[bundle-buddy-webpack-plugin](https://www.npmjs.com/package/bundle-buddy-webpack-plugin) 使其更易于使用。

如果它在您的构建中多次发现单个软件包, 则 [duplicate-package-checker-webpack-plugin](https://www.npmjs.com/package/duplicate-package-checker-webpack-plugin) 会警告您。否则很难发现这种情况。

[inspectpack](https://www.npmjs.com/package/inspectpack) 可用于找出要改进的代码的特定位置。下面的示例执行重复分析:
```bash
$ inspectpack --action=duplicates --bundle=bundle.js
## Summary

* Bundle:
    * Path:                /PATH/TO/bundle.js
    * Bytes (min):         1678533
* Missed Duplicates:
    * Num Unique Files:    116
    * Num Extra Files:     131
    * Extra Bytes (min):   253955
    * Pct of Bundle Size:  15 %
```

该工具还带有一个插件, 您可以将其直接附加到配置中, 以防您希望在构建过程中执行检查。

### 了解模块捆绑的原因
[whybundled](https://www.npmjs.com/package/whybundled) 旨在回答为什么捆绑包中包含特定模块的问题。

::: tip-zh | 
`--display-reasons` 标志也会提供更多信息。范例: `npm run build -- --display-reasons`。另一种选择是设置 `webpack` 配置 `stats.reasons` 为 `true`。
:::

### 结论
当您优化捆绑输出的大小时, 这些工具是无价的。官方工具具有最多的功能, 但即使是基本的可视化也可以发现问题点。您可以对旧项目使用相同的技术来了解其组成。

回顾一下:
- `Webpack` 允许您提取包含有关构建信息的 `JSON` 文件。数据可以包括构建组成和时间安排。
- 可以使用各种工具对生成的数据进行分析, 这些工具可以洞悉各个方面, 例如捆绑包的组成。
- 性能预算允许您设置构建大小的限制。维持预算可以使开发人员更了解生成的捆绑包的大小。
- 了解捆绑包是优化整体大小, 加载内容和时间的关键。它还可以揭示更重要的问题, 例如冗余数据。

在下一章中, 您将学习调整 `webpack` 的性能。