## 自动处理前缀
要记住特定 `CSS` 规则必须使用哪些供应商前缀来支持各种各样的用户, 这可能很有挑战性。**自动处理前缀**解决了这个问题。它可以通过 `PostCSS` 和 [autoprefixer](https://www.npmjs.com/package/autoprefixer) 插件启用。**autoprefixer** 使用 [Can I Use](https://caniuse.com/) 服务来确定应该为哪些规则加前缀, 并且可以进一步调整其行为。

### 配置自动处理前缀
实现自动处理前缀仅需对当前配置进行少量添加。首先安装 *`postcss-loader`* 和 **`autoprefixer`**:
```bash
npm add postcss-loader autoprefixer --develop
```

添加配置以启用自动前缀:

**webpack.parts.js**
```js
exports.autoprefix = () => ({
  loader: "postcss-loader",
  options: {
    // postcssOptions: {
      plugins: [require("autoprefixer")()],
    // }
  },
});
```
> 译者注: 如果使用 `PostCSS 4.x`, 请添加注释内容。

想要使用, 请按如下所示进行配置:

**webpack.config.js**
```js{1,3}
// const cssLoaders = [parts.tailwind()]

const cssLoaders = [parts.autoprefix(), parts.tailwind()];
```
::: warning-zh | 
加载器的顺序很重要, 因为自动处理前缀应在 `Tailwind` 完成处理后进行。上面的配置解析为 <mark>autoprefix(tailwind(input))</mark>。
:::

### 定义浏览器列表
**`autoprefixer`** 依靠[浏览器列表](https://www.npmjs.com/package/browserslist)定义起作用。

要定义要支持的浏览器, 请创建一个 `.browserslistrc` 文件。不同的插件都可以使用这个定义文件, 包括 **`autoprefixer`**。

**.browserslistrc**
```
> 1% # Browser usage over 1%
Last 2 versions # Or last two versions
IE 8 # Or IE 8
```

如果现在(`npm run build`)构建应用程序并检查产出的 `CSS` 文件, 则应该看到已为 `CSS` 样式添加前缀以支持较旧的浏览器。尝试调整定义, 以查看其对构建输出的影响。

::: tip-zh | 
您可以通过 [Stylelint](http://stylelint.io/) 整理 `CSS`。可以通过 `postcss-loader` 以与上述自动添加前缀相同的方式进行设置。
:::

::: tip-zh | 
通过在声明之间使用某种语法, 可以为每个开发目标(在环境中定义 <mark>BROWSERSLIST_ENV</mark> 或 <mark>NODE_ENV</mark>)定义浏览器列表 `[development]`。有关更多信息和选项, 请参阅[浏览器列表文档](https://www.npmjs.com/package/browserslist#configuring-for-different-environments)。
:::

### 结论
自动添加前缀是一种方便的技术, 因为它减少了编写 `CSS` 样式时所需的工作量。您可以在 `.browserslistrc` 文件中维护最低浏览器要求。然后, 插件可以使用该信息来生成最佳输出。

回顾一下:
- 可以通过 `PostCSS` 插件 **`autoprefixer`** 启用自动添加前缀。
- 自动添加前缀会根据您的浏览器列表写入缺少的 `CSS` 定义。
- `.browserslistrc` 是一个通用的标准文件, 也可以被除 **`autoprefixer`** 之外的其他插件使用。

