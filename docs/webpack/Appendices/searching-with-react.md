## 用 React 搜索
假设您要对没有后台的应用程序进行粗略的搜索。您可以使用过 [lunr](http://lunrjs.com/) 进行操作, 并生成一个静态搜索索引来提供服务。

问题在于, 索引的大小取决于内容的数量。好在您并不需要从一开始搜索索引。您可以做一些取巧的事情。当用户选择搜索字段时, 再开始加载索引。

这样做会造成延迟加载, 并将其移动到更合理的地方提升以性能。初始搜索将比后续搜索慢, 并且您应该显示加载指示器。但这从用户的角度来看很好。`Webpack` 的代码拆分功能允许执行此操作。

### 用代码拆分实现搜索
要实现代码拆分, 您需要决定将拆分点放在哪里。将其放置好, 然后处理 <mark>Promise</mark>:
```js
import("./asset").then(asset => ...).catch(err => ...)
```
最美妙的是, 这可以在发生故障(网络故障等)时提供错误处理, 并提供了进行恢复的机会。您还可以使用基于 <mark>Promise</mark> 的实用程序, 例如使用 <mark>Promise.all</mark> 编写更复杂的查询。

在这种情况下, 您需要检测用户何时选择搜索元素, 加载数据(除非已经加载数据), 然后对其执行搜索逻辑。考虑下面的 `React` 实现:

**App.js**
```jsx
import React from "react";

const App = () => {
  const [index, setIndex] = React.useState(null);
  const [value, setValue] = React.useState("");
  const [lines, setLines] = React.useState([]);
  const [results, setResults] = React.useState([]);

  const search = (lines, index, query) => {
    // Search against index and match README lines.
    return index
      .search(query.trim())
      .map((match) => lines[match.ref]);
  };

  const onChange = ({ target: { value } }) => {
    // Set captured value to input
    setValue(value);

    // Search against lines and index if they exist
    if (lines && index) {
      setResults(search(lines, index, value));

      return;
    }

    // If the index doesn't exist, it has to be set it up.
    // You could show loading indicator here as loading might
    // take a while depending on the size of the index.
    loadIndex()
      .then(({ index, lines }) => {
        setIndex(index);
        setLines(lines);

        // Search against the index now
        setResults(search(lines, index, value));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="app-container">
      <div className="search-container">
        <label>Search against README:</label>
        <input type="text" value={value} onChange={onChange} />
      </div>
      <div className="results-container">
        <Results results={results} />
      </div>
    </div>
  );
};

const Results = ({ results }) => {
  if (results.length) {
    return (
      <ul>
        {results.map((result, i) => (
          <li key={i}>{result}</li>
        ))}
      </ul>
    );
  }

  return <span>No results</span>;
};

function loadIndex() {
  // Here's the magic. Set up `import` to tell Webpack
  // to split here and load our search index dynamically.
  //
  // Note that you will need to shim Promise.all for
  // older browsers and Internet Explorer!
  return Promise.all([
    import("lunr"),
    import("../search_index.json"),
  ]).then(([{ Index }, { index, lines }]) => {
    return {
      index: Index.load(index),
      lines,
    };
  });
}
```
在示例中, `webpack` 静态检测 <mark>import</mark>。它可以基于此拆分点生成单独的捆绑包。由于它依赖静态分析, 因此您无法在这种情况下执行 <mark>loadIndex</mark> 并将搜索索引路径作为参数传递。

### 结论
除了搜索之外, 该方法也可以与路由器一起使用。当用户输入地址时, 您可以加载结果视图所需的依赖项。或者, 您可以在用户滚动页面并获取具有实际功能的相邻部分时开始加载依赖项。<mark>import</mark> 提供了强大的功能, 并允许您保持应用程序的精简(初次加载)。

您可以找到[完整示例](https://github.com/survivejs-demos/lunr-demo), 说明如何将 `lunr`, `React` 和 `Webpack` 一起使用。基本思路是相同的, 但是还有更多的配置。

回顾一下:
- 如果您的数据集很小且是静态的, 则客户端搜索是一个不错的选择。
- 您可以使用诸如 `lunr` 之类的解决方案为您的内容建立索引, 然后针对该内容执行搜索。
- `Webpack` 的**代码拆分**功能非常适合按需加载搜索索引。
- 可以将代码拆分与 `UI` 解决方案(如 `React`)结合使用, 以实现整个用户界面。