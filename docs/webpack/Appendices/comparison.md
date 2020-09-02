## 构建工具比较
过去, 将脚本连在一起就足够了。但是, 时代已经改变了, 分发 `JavaScript` 代码可能是一项复杂的工作。随着单页应用程序(`SPA`)的兴起, 这个问题变得愈发显著, 因为它们(`SPA`)往往依赖许多大型库。因此, 产生了许多加载策略。但其基本思想是延迟加载而不是一次加载全部。

`Node` 和其软件包管理器 [npm](https://www.npmjs.com/) 的流行提供了更多的上下文。在 `npm` 流行之前, 很难进行依赖管理。曾经有一段时间, 人们开发了特定于前端的包管理器, 但最终 `npm` 赢得了胜利。现在, 依赖管理比以前更舒适, 尽管仍有许多挑战需要克服。

::: tip-zh | 
[Tooling.Report](https://bundlers.tooling.report/) 提供了最流行的构建工具的功能比较。
:::

### Task runners
历史上有很多构建工具。***Make*** 可能是最有名的, 而且它仍然是一个可靠的选择。也有专门为 `JavaScript` 开发人员设计的任务运行程序, 比如 `Grunt` 和 `Gulp`。通过 `npm` 提供的插件使这两个任务运行器都即强大又可扩展。甚至可以将 `npm` <mark>scripts</mark> 用作任务运行器。这很常见, 尤其是在 `webpack` 中。

#### Make
[Make](https://en.wikipedia.org/wiki/Make_%28software%29) 可以追溯到 `1977` 年最初发布的时候。尽管它是一个有些年头的工具, 但仍然具备重要性。`Make` 允许您编写单独的任务达成不成的目的。例如, 您可能有不同的任务来创建生产版本、压缩 `JavaScript` 或运行测试。您可以在许多其他工具中找到相同的想法。

尽管 `Make` 大多用于 `C` 项目, 但它实际上与 `C` 没有任何联系。James Coglan 详细讨论了[如何在JavaScript中使用Make](https://blog.jcoglan.com/2014/02/05/building-javascript-projects-with-make/)。考虑以下基于 James 帖子的缩写代码:

**Makefile**
```makefile
PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

source_files := $(wildcard lib/*.coffee)
build_files  := $(source_files:%.coffee=build/%.js)
app_bundle   := build/app.js
spec_coffee  := $(wildcard spec/*.coffee)
spec_js      := $(spec_coffee:%.coffee=build/%.js)

libraries    := vendor/jquery.js

.PHONY: all clean test

all: $(app_bundle)

build/%.js: %.coffee
    coffee -co $(dir $@) $<

$(app_bundle): $(libraries) $(build_files)
    uglifyjs -cmo $@ $^

test: $(app_bundle) $(spec_js)
    phantomjs phantom.js

clean:
```

使用 `Make`, 您可以使用 `Make` 特定的语法和终端命令为任务建模, 从而可以与 `webpack` 集成。

#### npm `scripts` 作为 task runner
即使 `npm CLI` 最初并非被设计用作任务运行程序, 但还是要感谢 `package.json` <mark>scripts</mark> 字段。参考下面的示例:

**package.json**
```json
{
    "scripts": {
        "start": "wp --mode development",
        "build": "wp --mode production",
        "build:stats": "wp --mode production --json > stats.json"
    }
}
```

可以使用 <mark>npm run</mark> 列出这些脚本, 然后使用 <mark>npm run &lt;script&gt;</mark> 执行这些脚本。您还可以使用诸如 <mark>test:watch</mark> 的约定对脚本进行命名。这种方法的问题在于要保证兼容性。

您可能希望使用 [rimraf](https://www.npmjs.com/package/rimraf) 等实用程序来替代 <mark>rm -rf</mark>。可以在这里调用其他任务运行器来隐藏您正在使用的。这样, 您就可以重构工具, 同时保持接口不变。

#### Grunt
[Grunt](https://gruntjs.com/) 是前端开发人员的第一个著名任务执行器。它的插件架构为它的流行提供了保障。插件本身通常很复杂。结果, 随着配置文件的增长, 了解正在发生的事情变得十分困难。

这是[Grunt 文档](https://gruntjs.com/sample-gruntfile)中的示例。在此配置中, 您定义了 `lint` 和 `watch` 任务。当 `watch` 任务运行时, 它也会触发 `lint` 任务。这样, 当您运行 `Grunt` 时, 您在编辑源代码时会在终端中实时收到警告。

**Gruntfile.js**
```js
module.exports = (grunt) => {
  grunt.initConfig({
    lint: {
      files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"],
      options: {
        globals: {
          jQuery: true,
        },
      },
    },
    watch: {
      files: ["<%= lint.files %>"],
      tasks: ["lint"],
    },
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["lint"]);
};
```

实际上, 您将有许多用于特定目的的小任务, 例如构建项目。`Grunt` 的一个重要特性是它为您隐藏了许多细节。

当您用的越多, 越有可能出现问题, 因为您很难理解引擎盖下到底发生了什么。这是从 `Grunt` 身上学到的构建教训。

::: tip-zh | 
[grunt-webpack](https://www.npmjs.com/package/grunt-webpack) 插件使您可以在 `Grunt` 环境中使用 `webpack`, 而无需进行繁琐的配置工作。
:::

#### Gulp
[Gulp](http://gulpjs.com/) 采用了不同的方法。您无需处理每个插件的配置, 而是直接编写实际的代码。如果您熟悉 `Unix` 和 `pipe`, 那么您会喜欢 `Gulp` 的。您有与文件匹配的源、对这些源操作的过滤器以及用于处理 `pipe` 生成结果的接收器。

这是从项目的 `README` 改编而成的简短示例 *Gulpfile*, 使您可以更好地了解这种方法:

**Gulpfile.js**
```js
const gulp = require("gulp");
const coffee = require("gulp-coffee");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");

const paths = {
  scripts: [
    "client/js/**/*.coffee",
    "!client/external/**/*.coffee",
  ],
};

// Not all tasks need to use streams.
// A gulpfile is another node program
// and you can use all packages available on npm.
gulp.task("clean", () => del(["build"]));
gulp.task("scripts", ["clean"], () =>
  // Minify and copy all JavaScript (except vendor scripts)
  // with source maps all the way down.
  gulp
    .src(paths.scripts)
    // Pipeline within pipeline
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(uglify())
    .pipe(concat("all.min.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("build/js"))
);
gulp.task("watch", () => gulp.watch(paths.scripts, ["scripts"]));

// The default task (called when you run `gulp` from CLI).
gulp.task("default", ["watch", "scripts"]);
```

鉴于配置就是代码, 如果遇到问题您可以随时修改它。您可以将现有的 `node` 包包装为 `Gulp` 插件等等。与 `Grunt` 相比, 您对发生的事情有了更清晰的了解。不过, 您最终还是要为一些临时任务编写大量的样板文件。这就是产生新的解决方案的原因。

::: tip-zh | 
[webpack-stream](https://www.npmjs.com/package/webpack-stream) 允许您在 `Gulp` 环境中使用 `webpack`。
:::

### Script loaders
有一阵子, 脚本加载器 [RequireJS](http://requirejs.org/) 很流行。其核心思想是提供一个异步模块定义并在此基础上构建。幸运的是, 标准已经具备这些功能, 现在 `RequireJS` 似乎更像是一种罕见而有趣之物。

#### RequireJS
[RequireJS](http://requirejs.org/) 也许是第一个真正流行的脚本加载器。它让我们第一次正确地了解了网络上的模块化 `JavaScript`。其最大的吸引力是 `AMD`。它引入了一个 <mark>define</mark> 包装器:
```js
define(["./MyModule.js"], function (MyModule) {
  return function() {}; // Export at module root
});

// or
define(["./MyModule.js"], function (MyModule) {
  return {
    hello: function() {...}, // Export as a module function
  };
});
```

顺便说一句, 可以在包装器内使用 <mark>require</mark>:
```js
define(["require"], function (require) {
  var MyModule = require("./MyModule.js");

  return function() {...};
});
```

后一种方法消除了一部分混乱, 提升了代码的可读性。但遗憾的是, 您仍然会感到多余的代码。不过好在 `ES2015` 和其他标准解决了这个问题。

::: tip-zh | 
Jamund Ferguson 写了一篇很棒的博客文章, 介绍了[如何从 RequireJS 移植到 webpack](https://gist.github.com/xjamundx/b1c800e9282e16a6a18e)。
:::

#### JSPM
使用 [JSPM](http://jspm.io/) 与以前的工具完全不同。它带有自己的命令行工具, 该工具可用于将新软件包安装到项目, 创建生产包等。它支持 [SystemJS 插件](https://github.com/systemjs/systemjs#plugins), 使您可以将各种格式加载到项目中。

### Bundlers
从总体上讲, 任务运行器是出色的工具。它们允许您以跨平台的方式执行操作。当您需要将各种资源拼接在一起并产生捆绑包时, 问题就开始了。打包工具, 如 `Browserify`, `Brunch`, `Webpack`, 就是为了解决这个问题而产生的, 它们在较低的抽象级别上操作。它们不是对文件直接进行操作, 而是对模块和资源进行操作。

#### Browserify
处理 `JavaScript` 模块一直是一个问题。直到 `ES2015`, 语言本身才具备了模块的概念。因此, 在浏览器环境中, 该语言依旧停留在 `90` 年代。同时提出了包括 [AMD](http://requirejs.org/docs/whyamd.html) 在内的各种解决方案。

[Browserify](http://browserify.org/) 是解决模块问题的一种方法。它允许将 `CommonJS` 模块捆绑在一起。您可以将其与 `Gulp` 一起使用, 并且可以找到较小的转换工具, 使您可以超越基本用法。例如, [watchify](https://www.npmjs.com/package/watchify) 提供了一个文件监视程序, 该文件监视程序可以在节省开发成本的前提下为您创建捆绑包。

`Browserify` 生态系统由许多小模块组成。通过这样的形式 `Browserify` 遵循 `Unix` 哲学。`Browserify` 与 `Webpack` 相比更易于使用, 并且实际上是替代它的好方法。

::: tip-zh | 
[Splittable](https://www.npmjs.com/package/splittable) 是 `Browserify` 包装器, 允许代码拆分, 支持 `ES2015` 开箱即用、`tree shaking`, 等等。[bankai](https://www.npmjs.com/package/bankai) 是另一个可以考虑的选择。
:::

#### Brunch
与 `Gulp` 相比, [Brunch](http://brunch.io/) 的抽象层次更高。它使用类似于 `webpack` 的声明方法。为了给您提供一个示例, 请考虑以下来自Brunch站点的配置:
```js
module.exports = {
  files: {
    javascripts: {
      joinTo: {
        "vendor.js": /^(?!app)/,
        "app.js": /^app/,
      },
    },
    stylesheets: {
      joinTo: "app.css",
    },
  },
  plugins: {
    babel: {
      presets: ["react", "env"],
    },
    postcss: {
      processors: [require("autoprefixer")],
    },
  },
};
```
`Brunch` 附带的命令包括: <mark>brunch new</mark>, <mark>brunch watch --server</mark> 和 <mark>brunch build --production</mark>。它包含很多现成的内容, 可以使用插件进行扩展。

#### Rollup
[Rollup](https://www.npmjs.com/package/rollup) 专门用于打包 `ES2015` 代码。*Tree shaking* 是它的卖点之一, 它还支持代码拆分。您可以通过 [rollup-loader](https://www.npmjs.com/package/rollup-loader) 将 `Rollup` 与 `webpack` 一起使用。

[vite](https://www.npmjs.com/package/vite) 是建立在 `Rollup` 之上固执己见的包装器, 并且在设计时特别考虑了 `Vue 3`。[nollup](https://www.npmjs.com/package/nollup) 是另一个包装器, 它具有开箱即用的功能, 例如[模块热更新](./hmr.html)。

#### Webpack
您可以说 [webpack](https://webpack.js.org/) 比 `Browserify` 采用了更为统一的方法。`Browserify` 由多个小工具组成, 而 `webpack` 带有一个核心, 可提供许多现成的功能。

`Webpack` 核心可以使用特定的加载器和插件进行扩展。它控制着如何解析模块, 从而使您的构建适应特定情况和解决无法正常使用的包成为可能。

与其他工具相比, `webpack` 具有初始复杂性, 但是它通过其广泛的功能集弥补了这一点。这是一个需要耐心的高级工具。但是一旦您了解了它的基本概念, `webpack` 就变得强大了。

为了使其易于使用, 围绕它构建了诸如 [create-react-app](https://www.npmjs.com/package/create-react-app), [poi](https://poi.js.org/) 和 [instapack](https://www.npmjs.com/package/instapack) 之类的工具。

### 零配置打包工具
有一类零配置打包工具。其想法是, 它们无需任何额外的设置即可直接使用。[Parcel](https://parceljs.org/) 也许是其中的佼佼者。

[FuseBox](https://www.npmjs.com/package/fuse-box) 是一个专注于速度的打包工具。它使用零配置方法, 旨在开箱即用。

这些工具包括 [microbundl](https://www.npmjs.com/package/microbundle), [bili](https://www.npmjs.com/package/bili), [asbundle](https://www.npmjs.com/package/asbundle) 和 [tsdx](https://www.npmjs.com/package/tsdx)。

### 其他选择
您可以找到以下列出的更多替代方案:
- [Rome](https://romefrontend.dev/) 是围绕 `linting`, 编译和打包问题构建的一个完整的工具链。
- [Snowpack](https://www.snowpack.dev/) 是用于 `Web` 开发的轻量级工具链。[Drew Powers 很好地解释了它与 webpack 的区别](https://blog.logrocket.com/snowpack-vs-webpack/)。
- [esbuild](https://www.npmjs.com/package/esbuild) 是用 `Go` 编写的面向性能的打包工具。
- [AssetGraph](https://www.npmjs.com/package/assetgraph) 采用完全不同的方法, 并基于 `HTML` 语义构建, 使其非常适合于[超链接分析](https://www.npmjs.com/package/hyperlink)或[结构分析](https://www.npmjs.com/package/assetviz)。[webpack-assetgraph-plugin](https://www.npmjs.com/package/webpack-assetgraph-plugin) 将 `webpack` 和 `AssetGraph` 连接在一起。
- [StealJS](https://stealjs.com/) 是一个依赖性加载器和构建工具, 专注于性能和易用性。
- [Blendid](https://www.npmjs.com/package/blendid) 是 `Gulp` 和 `bundler` 的混合体, 形成了一个资源管道。
- [swc](https://swc-project.github.io/) 是专注于性能的 `JavaScript/TypeScript` 编译器。
- [Sucrase](https://www.npmjs.com/package/sucrase) 是一个轻量级的 `JavaScript/TypeScript` 编译器, 专注于性能和最新语言特性。

### 结论
过去有很多 `JavaScript` 构建工具。每个人都试图以自己的方式解决特定的问题。这些标准已经开始完善, 并且在基本语义方面所需的工作更少。取而代之的是, 工具可以在更高层次上竞争, 并朝着更好的用户体验发展。通常, 您可以同时使用几个单独的解决方案。

回顾一下:

- `Task runner` 和 `bundler` 解决了不同的问题。两者都可以达到相似的结果, 但是通常最好将它们结合使用以相互补充。
- 即使较旧的工具在 `Web` 开发中不再那么流行, 如 `Make` 或 `RequireJS` 之类的旧工具仍然具有影响力。
- 诸如 `Browserify` 或 `Webpack` 之类的打包工具可以解决一个重要问题, 并帮助您管理复杂的 `Web` 应用程序。
- 新兴技术从不同角度解决了这个问题。有时它们建立在其他工具之上, 有时它们可以一起使用。