## 介绍
[Webpack](https://webpack.js.org/) 通过解决一个基本问题来简化 `Web` 开发: 打包(`bundling`)。它接受各种资源, 例如 `JavaScript`, `CSS` 和 `HTML`, 并将其转换为便于通过浏览器使用的格式。做好这一点可以有效减少 `Web` 开发的痛苦。

由于其配置驱动的方法, 它不是最易学的工具, 但它功能十分强大。本指南的目的是帮助您开始使用 `Webpack` 并超越基础知识。

### 什么是 Webpack
`Web` 浏览器使用 `HTML`, `CSS`, `JavaScript` 和多媒体文件。随着项目的发展, 跟踪所有这些文件并使它们适应不同的目标（例如浏览器）变得非常困难, 以至于不借助其他工具就无法管理。`Webpack` 解决了这些问题。管理复杂性是 `Web` 开发的基本问题之一, 而合理的解决此问题将为开发提供极大帮助。

`Webpack` 不是唯一可用的打包工具, 并且出现了许多不同的工具。任务执行者(例如 `Grunt` 和 `Gulp`)是高级工具的很好的例子。通常, 问题在于您需要手动编写工作流程。将问题推送到诸如 `webpack` 的打包工具是向前迈出的一步。

特定于框架的抽象(例如 [create-react-app](https://www.npmjs.com/package/create-react-app) 或 [@angular/cli](https://www.npmjs.com/package/@angular/cli)) 在其中也是使用的 `webpack`。也就是说, 如果您必须自定义设置, 那么了解该工具(`webpack`)仍然有价值。

### Webpack如何改变现状
`Webpack` 采取了另一条路线。它使您可以将项目视为依赖图。您的项目中可能有一个 `index.js`, 它通过标准 `require` 或 `import` 语句获取项目所需的依赖项。如果需要, 可以以相同的方式引用样式文件和其他资源。

`Webpack` 为您完成所有预处理, 并通过配置和代码为您提供指定的打包形式。这种声明性方法用途广泛, 但学习起来却充满挑战。

开始了解 `Webpack` 的工作原理后, `Webpack` 成为 `web` 开发必不可少的工具。本书的存在是为了克服最初、也是最困难的学习过程, 并教会阅读者如何使用或者更深入的了解。

### 能够学到什么
编写这本书是为了补充[webpack的正式文档](https://webpack.js.org/), 并且可以认为它是它的伴侣。该书可帮助您通过最初的学习曲线, 并进一步深入了解。

您将学习为开发和生产目的开发可组合的 `webpack` 配置。本书涵盖的高级技术可让您充分利用 `webpack`。

### 这本书是如何组织的
本书从解释什么是 `webpack` 开始。之后, 您会发现从不同的角度讨论 `webpack` 的多个章节。在阅读这些章节时, 您将开发相应的 `Webpack` 配置, 同时学习基本技术。

本书包括以下部分:

- **Developing**: 使您知道如何使用 `webpack` 并开始运行。本部分介绍了自动刷新浏览器等功能, 并说明了如何构成您的配置, 使其保持可维护性。
- **Styling**: 非常强调与样式相关的主题。您将学习如何使用 `webpack` 加载样式, 并在设置中引入自动处理前缀等技术。
- **Loading**: 详细解释了 `webpack` 的加载器定义, 并向您展示了如何加载资源, 例如图像、字体和 `JavaScript`。
- **Building**: 介绍了 `source map`、打包和代码拆分的思想。您将学习整理您的构建。
- **Optimizing**: 会将您的构建质量推向生产水平, 并进行许多较小的调整以使其体积更小。您将学习调整 `webpack` 的性能。
- **Output**: 讨论了 `webpack` 的输出相关技术。尽管名称如此, 但它不仅仅适用于 `web`。您将了解如何使用 `webpack` 管理多个页面设置, 了解服务器端渲染的基本概念, 并了解有关模块联合的信息。
- **Techniques**: 讨论了一些特定的想法, 包括动态加载、`Web Worker`、`i18n`(国际化)、部署应用程序以及通过 `webpack` 使用 `npm` 软件包。
- **Extending**: 展示了如何使用加载器和插件扩展 `webpack`。

最后, 有一个简短的结论章节, 概述了本书的要点。它包含本书中的技术清单, 可让您有条不紊地研究项目。

本书末尾的附录涵盖了次要主题, 有时还会更深入地探讨主要主题。您可以根据自己的兴趣以任意顺序处理它们。

最后的[故障排除](./Appendices/troubleshooting.html)附录介绍了当 `webpack` 给您错误时的处理方法。它包括一个过程, 因此您知道该怎么办以及如何调试问题。如有疑问, 请研究附录。如果不确定某个术语及其含义, 请参阅本书末尾的[术语表](./Appendices/glossary.html)。

### 为谁编写
该书主要是为初学者和中级开发人员撰写的。对于已经非常了解 `webpack` 的专家来说, 使用相应技术的想法与思路是有价值的。每章和[结论](https://survivejs.com/webpack/conclusion/)一章中包含的书摘都使您可以快速浏览和了解这些想法。

特别是在初级和中级阶段, 有必要按照书中的教程进行操作, 并从头开始开发自己的 `webpack` 配置, 然后查看与您最相关的章节。唯一期望您具有`JavaScript`, `Node` 和 `npm` 的基本知识。

即使您通过诸如 `Create React App` 之类的抽象方式使用 `webpack`, 了解该工具也很有价值, 以防万一您必须修改部分配置信息。讨论的许多技术超出了 `webpack` 本身, 并且在日常开发中非常有用, 例如, 您是否需要优化 `web` 应用程序或网站。

### 约定
本书使用了几种约定来保持内容的可阅读性。我在下面列出了示例:
::: tip-zh | 
这是一个提示。通常, 您可以在提示中找到辅助信息和更多参考。
:::

::: warning-zh | 
这是一个警告, 突出显示了意外的行为或您应该知道的常见问题点。
:::

尤其在本书开头, 编程是以教程形式编写的。因此, 使用以下语法:
```js{2,5,8-9}
// 这是插入, 代码高亮
const webpack = require("webpack");

// 这是删除, 高亮+注释
// const { MiniHtmlWebpackPlugin } = require("mini-html-webpack-plugin");

// 或者是两者的结合
// const { MiniHtmlWebpackPlugin } = require("mini-html-webpack-plugin");
const webpack = require("webpack");

// 这是一些省略内容
......
```

有时, 代码假设添加时没有突出显示插入内容, 而且本书的许多示例都不是单独使用的, 我已经在可能的情况下与先决条件进行了交叉连接。

您还会在句子中看到 <mark>code</mark>, 有时还会**突出显示**重要的术语。您可以在[术语表](./Appendices/glossary.html)中找到这些术语的定义。

::: tip-zh | 
本书示例中特意使用了逗号结尾，因为它为代码示例提供了更清晰的区别。
:::

### 版本
本书使用版本控制方案, 并且每个新版本的发行说明都在该[博客](https://survivejs.com/blog/)上维护。您也可以为此使用 `GitHub` 比较工具。例:

```bash
https://github.com/survivejs/webpack-book/compare/v2.3.0...v2.6.1
```

该页面显示了在给定版本范围内进入项目的单个提交。您还可以查看书中已更改的行。

本书的当前版本是 **`2.6.1`**。

### 支持
如果您遇到麻烦或对内容有疑问, 可以使用以下几种方法:

- 通过[GitHub Issue Tracker](https://github.com/survivejs/webpack-book/issues)与我联系。
- 和我在[Gitter Chat](https://gitter.im/survivejs/webpack)中讨论。
- 给我发送电子邮件至 [info@survivejs.com](mailto:info@survivejs.com)。
- 在 [SurviveJS AmA](https://github.com/survivejs/ama/issues) 问我有关 `webpack` 的任何信息。

如果您将问题发布到 `Stack Overflow`, 请使用 **Survivaljs** 标记问题。您可以在 `Twitter` 上使用 **#survivejs** 主题标签来获得相同的结果。

我可以进行商业咨询。在过去的工作中, 我曾帮助公司优化对 `webpack` 的使用。这项工作以更高性能和优化的构建形式对开发人员的体验和最终用户都有影响。

### 在哪里可以找到其他资料
您可以从以下来源找到更多相关材料:

- 加入[邮件列表](https://buttondown.email/SurviveJS)以获取不定期更新。
- 在 `Twitter` 上关注[@survivejs](https://twitter.com/survivejs)。
- 订阅[博客RSS](https://survivejs.com/atom.xml)可以访问访谈等等。
- 订阅[YouTube频道](https://www.youtube.com/SurviveJS)。
- 查看[SurviveJS相关的演示幻灯片](https://presentations.survivejs.com/)。

### 致谢
非常感谢 [Christian Alfoni](http://www.christianalfoni.com/) 帮助我编写了本书的第一版, 因为这激发了整个 **SurviveJS** 的工作。您现在看到的文本是完全重写版本。

如果没有编辑 [Jesús Rodríguez](https://github.com/Foxandxss)、[Artem Sapegin](https://github.com/sapegin) 和 [Pedr Browne](https://github.com/Undistraction) 耐心的编辑和反馈, 这本书不会有现在的一半好。谢谢您。

没有最初的 `SurviveJS-Webpack and React`, 这本书是不可能的。任何对此做出贡献的人都值得我感谢。您可以检查该书以获取更准确的出处。

非常感谢 Mike “Pomax” Kamermans, Cesar Andreu, Dan Palmer, Viktor Jančík, Tom Byrer, Christian Hettlage, David A. Lee, Alexandar Castaneda, Marcel Olszewski, Steve Schwartz, Chris Sanders, Charles Ju, Aditya Bhardwaj, Rasheed Bustamam, José Menor, Ben Gale, Jake Goulding, Andrew Ferk, gabo, Giang Nguyen, @Coaxial, @khronic, Henrik Raitasola, Gavin Orland, David Riccitelli, Stephen Wright, Majky Bašista, Gunnari Auvinen, Jón Levy, Alexander Zaytsev, Richard Muller, Ava Mallory (Fiverr), Sun Zheng' an, Nancy (Fiverr), Aluan Haddad, Steve Mao, Craig McKenna, Tobias Koppers, Stefan Frede, Vladimir Grenaderov, Scott Thompson, Rafael De Leon, Gil Forcada Codinachs, Jason Aller, @pikeshawn, Stephan Klinger, Daniel Carral, Nick Yianilos, Stephen Bolton, Felipe Reis, Rodolfo Rodriguez, Vicky Koblinski, Pyotr Ermishkin, Ken Gregory, Dmitry Kaminski, John Darryl Pelingo, Brian Cui, @st-sloth, Nathan Klatt, Muhamadamin Ibragimov, Kema Akpala, Roberto Fuentes, Eric Johnson, Luca Poldelmengo, Giovanni Iembo, Dmitry Anderson , Douglas Cerna, Chris Blossom, Bill Fienberg, Andrey Bushman, Andrew Staroscik, Cezar Neaga, Eric Hill, Jay Somedon, Luca Fagioli, @cdoublev, Boas Mollig, Shahin Sheidaei, 以及其他许多为本书提供直接反馈的人!