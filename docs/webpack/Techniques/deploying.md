## 部署应用
使用 `webpack` 的项目可以部署到各种环境中。一个不依赖后端的公共项目可以使用 **`gh-pages`** 将其推到 `GitHub Pages`。此外还有各种各样的 `webpack` 插件可以针对其他环境, 如 **`S3`**。

### 使用 gh-pages 部署
[gh-pages](https://www.npmjs.com/package/gh-pages) 允许您轻松在 `GitHub Pages` 上托管独立应用程序。首先必须指向构建目录。它获取内容并将其推送到 `gh-pages` 分支。

不管它的名字是什么, 该软件包都可与其他 `Git` 存储库托管服务一起使用。但是, 鉴于 `GitHub` 非常有名, 它可以用来演示这个想法。在实践中, 您可能需要进行更复杂的设置, 这将通过"持续集成"系统将结果推送到另一服务。

#### 设置 gh-pages
首先, 执行:
```bash
npm add gh-pages --develop
```

您还将需要以下 `package.json` 脚本:

**package.json**
```json{2}
"scripts": {
  "deploy": "gh-pages -d dist",
  ......
},
```

为了确保资源路径在 `GitHub` 上可以正常工作, 必须调整 `output.publicPath` 字段。否则, 资源路径最终会指向根目录, 除非直接在域根目录之后进行托管(例如: `survivejs.com`), 否则资源路径将不起作用。

例如, 可以通过调整 `publicPath` 控制您在 `index.html` 上看到的 `URL` 结果 。如果您将资产托管在 `CDN` 上, 则可以进行调整。

在这种情况下, 将其设置为指向 `GitHub` 项目就足够了, 如下所示:

**webpack.config.js**
```js{6,7,9,10}
const productionConfig = merge([
  {
    ......
    output: {
      ......
      // // Needed for code splitting to work in nested paths
      // publicPath: "/",

      // Tweak this to match your GitHub project name
      publicPath: "/webpack-demo/",
    },
  },
  ......
]);
```

构建(`npm run build`)和部署(`npm run deploy`)之后, 您应该从 `GitHub Pages` 上托管的 `dist/` 目录中获取应用程序。假设一切正常应该可以在 `https://<name>.github.io/<project>` 找到它。

::: tip-zh | 
如果您需要更详细的设置, 请使用 `gh-pages` 提供的 `Node API`。但是, 它提供的默认命令行工具足以满足基本需求。
:::

::: tip-zh | 
`GitHub Pages` 允许您选择要部署的分支。即使对于不需要捆绑的小型网站, 也可以使用 `master` 分支。您也可以指向 `master` 分支中的 `./docs` 目录下并维护站点。
:::
> **BTW**: 现在 `Github` 新建项目的默认分支为 `main`, 不再使用 `master` 作为默认分支的名称。

#### 存档旧版本
`gh-pages` 提供了用于存档目的的 `add` 选项。这个想法如下:
1. 将站点的旧版本复制到临时目录中, 然后从中删除 `archive` 目录。您可以根据需要命名 `archive` 目录。
2. 清理并构建项目。
3. 将旧版本复制到 `dist/archive/_` 下。
4. 设置 `Node` 脚本以通过如下调用 `gh-pages` 并捕获回调中可能的错误:
   ```js
    ghpages.publish(path.join(__dirname, "dist"), { add: true }, cb);
   ```
### 部署到其他环境
尽管可以将部署问题推到 `webpack` 之外, 但有几个特定于 `webpack` 的实用工具可以派上用场:
- [webpack-deploy](https://www.npmjs.com/package/webpack-deploy) 是部署应用程序的集合, 甚至可以在 `webpack` 之外工作。
- [webpack-s3-sync-plugin](https://www.npmjs.com/package/webpack-s3-sync-plugin) 和 [webpack-s3-plugin](https://www.npmjs.com/package/webpack-s3-plugin) 将资源同步到 `Amazon`。
- [ssh-webpack-plugin](https://www.npmjs.com/package/ssh-webpack-plugin) 专为通过 `SSH` 进行部署而设计。
- [now-loader](https://www.npmjs.com/package/now-loader) 在资源级别上运行, 并允许将特定资源部署到 `Now` 托管服务。

::: tip-zh | 
要访问生成的文件及其路径, 请考虑使用 [assets-webpack-plugin](https://www.npmjs.com/package/assets-webpack-plugin)。路径信息使您可以在部署时将 `webpack` 与其他环境集成。
:::

::: warning-zh | 
为确保依赖较旧捆绑软件的客户端在部署新版本后仍能正常工作, 请不要删除旧文件, 直到它们确实不再使用时。您可以对部署时要删除的内容进行特定检查, 而不是删除所有旧资源。
:::

### 动态解析 output.publicPath
如果您事先不知道 `publicPath`, 可以按照以下步骤根据环境进行解决:
1. 在应用程序的入口设置 `__webpack_public_path__ = window.myDynamicPublicPath;` 并根据合适的方式解析它。
2. 从 `webpack` 配置中删除 `output.publicPath`。
3. 如果使用 `ESLint`, 将其设置为 `globals.__webpack_public_path__:true` 忽略全局。

编译时, `webpack` 会查找 `__webpack_public_path__` 并重写它, 以便它指向 `webpack` 逻辑。

::: tip-zh | 
有关在模块级别可用的其他特定于 `webpack` 的变量, 请参见 [webpack 文档](https://webpack.js.org/api/module-variables/)。
:::

### 结论
即使 `webpack` 不是部署工具, 您也可以找到部署相关的插件。

回顾一下:
- 可以处理 `Webpack` 之外的部署问题。例如, 您可以在 `npm` 脚本中实现此目的。
- 您可以动态配置 `webpack` 的 `output.publicPath` 。如果您不知道编译时间并想稍后再决定, 则此技术非常有用。这是可以通过 `globals.__webpack_public_path__` 实现。