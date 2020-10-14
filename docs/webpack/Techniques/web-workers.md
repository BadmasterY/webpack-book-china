## Web Workers
[Web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) 允许您将工作推送到 `JavaScript` 的主线程之外执行, 从而使它们便于进行冗长的计算和后台工作。

在主线程和 `worker` 线程之间进行数据通信会带来与通信相关的开销。拆分提供了隔离, 迫使工作人员无法直接操纵用户界面, 仅专注于逻辑。

如 ["Targets"](../Output/targets) 一章中所述, `webpack` 允许您将自己的应用程序构建为 `worker` 程序。为了更好地理解 `web worker` 的概念, 您将学习如何使用 [worker-loader](https://www.npmjs.com/package/worker-loader) 开发一个小型 `worker`。

### 设置 worker-loader
首先, 将 `worker-loader` 安装到项目中:
```bash
npm add worker-loader --develop
```

您可以不是将加载器定义推送到 `webpack` 配置, 而使用内联加载器定义来使演示看起来更加精简。有关替代方法的更多信息, 请参见["加载器定义"](../Loading/loader-definitions)一章。

### 设置 worker
`worker` 必须做两件事: 监听消息并做出回应。在这两个事件之间, 它可以执行计算。在这种情况下, 您接受文本数据, 将其附加到 `worker`, 然后发送结果:

**src/worker.js**
```js
self.onmessage = ({ data: { text } }) => {
  self.postMessage({ text: text + text });
};
```

### 设置主机
主机必须实例化 `worker`, 然后与它通信。这个想法几乎是一样的, 只有主机拥有控制权:

**src/component.js**
```js
import Worker from "worker-loader!./worker";

export default () => {
  const element = document.createElement("h1");
  const worker = new Worker();
  const state = { text: "foo" };

  worker.addEventListener("message", ({ data: { text } }) => {
    state.text = text;
    element.innerHTML = text;
  });

  element.innerHTML = state.text;
  element.onclick = () => worker.postMessage({ text: state.text });

  return element;
};
```

有这两个设置之后, `worker` 就可以工作了。当点击文本时, 它应该在 `worker` 完成其执行时改变应用程序状态。为了演示 `worker` 的异步特性, 可以尝试在其中加入延迟, 然后看看会发生什么。

### 在主机与 worker 之间共享信息
由于序列化的成本, 在主机和 `worker` 线程之间传递数据可能会很昂贵。通过使用 [Transferable 对象](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Passing_data_by_transferring_ownershi)可以将成本降到最低, 并且将来, 借助 [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) 可以共享数据。

### 其他选择
[webworkify-webpack](https://www.npmjs.com/package/webworkify-webpack) 的 `API` 允许您将 `worker` 用作常规 `JavaScript` 模块, 因为您可以避免示例解决方案中可见的 `self` 需求。 [workerize-loader](https://github.com/developit/workerize-loader) 和 [worker-plugin](https://github.com/GoogleChromeLabs/worker-plugin) 是其他 `api` 略有不同的选项。

[threads.js](https://threads.js.org/) 为更复杂的设置提供了一个全面的解决方案, 并且包括开箱即用的可观察对象和线程池等功能。有一个自定义 [threads-plugin](https://github.com/andywer/threads-plugin), 可用于将其与 `webpack` 集成。

### 结论
要注意的关键是, `worker` 无法访问DOM。您可以在 `worker` 线程中执行计算和查询, 但是它不能直接操作用户界面。

回顾一下:
- `Web Worker` 允许您将工作推出浏览器的主线程。这种拆分是有价值的, 特别是在性能成为问题的情况下。
- `Web Worker` 无法操纵 `DOM`。相反, 最好将它们用于冗长的计算和请求。
- `Web Worker` 提供的隔离可用于架构上的好处。它迫使程序员留在特定的沙箱中。
- 与 `Web Worker` 进行通信会带来开销, 这使他们变得不那么实用。随着规范的发展, 将来可能会改变。

您将在下一章中了解国际化。