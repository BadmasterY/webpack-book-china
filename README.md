# webpack-book-china
>重要！如果您想支持本书的开发，可以在[Leanpub](https://leanpub.com/survivejs-webpack)上购买。其中的一部分（约30％）将直接发送给webpack的作者以支持其开发。

这是一篇有关webpack的译文，当然，翻译官是BadmasterY（一个有大神梦的技术渣）。  
其实这一篇文章的由来只是在某个闷热的午后，突然想着，来深入学习一下webpack吧！于是翻了很久，找到了这本~~自认为~~很不错的外文书。  
当然，感谢一下这本书的作者[@Juho Vepsäläinen](https://github.com/bebraw)，提供了一本这么棒的书！Thanks！  
原文链接:https://github.com/survivejs/webpack-book 翻译内容全部来自个人使用过程中的理解，有错误请指出  

写在最开始：翻译这篇文章时，我所用的所有开发环境 npm: 5.8.0, Node: 8.11.0, webpack: 4.4.1, Windows: 6.1.7601(win7 64bit)

## 目录
>正在进行最后的修订，~~预计7.20-7.22陆续上传~~由于某些不可抗因素，推迟至7.27-8.3  

[00. 什么是webpack](https://github.com/BadmasterY/webpack-book-china/blob/master/0.What-is-webpack.md)  
[01. 设置项目](https://github.com/BadmasterY/webpack-book-china/blob/master/1.Set-up-the-project.md)  
[02. 安装webpack](https://github.com/BadmasterY/webpack-book-china/blob/master/2.Install-webpack.md)  
[03. 运行webpack](https://github.com/BadmasterY/webpack-book-china/blob/master/3.Executing-webpack.md)  
[04. 设置资源](https://github.com/BadmasterY/webpack-book-china/blob/master/4.Setting-up-assets.md)  
[05. 配置html-webpack-plugin](https://github.com/BadmasterY/webpack-book-china/blob/master/5.Configuring-html-webpack-plugin.md)  
[06. 检查输出](https://github.com/BadmasterY/webpack-book-china/blob/master/6.Examining-the-output.md)  
[07. 添加build快捷方式](https://github.com/BadmasterY/webpack-book-china/blob/master/7.Adding-a-build-shortcut.md)  
[08. HtmlWebpackPlugin扩展](https://github.com/BadmasterY/webpack-book-china/blob/master/8.HtmlWebpackPlugin-extensions.md)  
[09. watch模式与webpack-dev-server](https://github.com/BadmasterY/webpack-book-china/blob/master/9.Watch-and-webpack-dev-server.md)  
[10. 撰写配置](https://github.com/BadmasterY/webpack-book-china/blob/master/10.Composing-configuration.md)  
[11. 加载样式](https://github.com/BadmasterY/webpack-book-china/blob/master/11.Loading-styles.md)  
[12. 分离 css](https://github.com/BadmasterY/webpack-book-china/blob/master/12.Separating-css.md)  
[13. css 模块](https://github.com/BadmasterY/webpack-book-china/blob/master/13.Css-modules.md)  
[14. 消除未使用的 css](https://github.com/BadmasterY/webpack-book-china/blob/master/14.Eliminating-unused-css.md)  
[15. 自动添加前缀](https://github.com/BadmasterY/webpack-book-china/blob/master/15.Autoprefixing.md)  
[16. 加载器定义](https://github.com/BadmasterY/webpack-book-china/blob/master/16.Loader-definitions.md)  
[17. 加载图片](https://github.com/BadmasterY/webpack-book-china/blob/master/17.Loading-images.md)  
[18. 加载字体](https://github.com/BadmasterY/webpack-book-china/blob/master/18.Loading-fonts.md)  
[19. 加载 JavaScript](https://github.com/BadmasterY/webpack-book-china/blob/master/19.Loading-javascript.md)  
[20. Source Maps](https://github.com/BadmasterY/webpack-book-china/blob/master/20.Source-maps.md)  
[21. bundle 拆分](https://github.com/BadmasterY/webpack-book-china/blob/master/21.Bundle-splitting.md)  
[22. 代码拆分](https://github.com/BadmasterY/webpack-book-china/blob/master/22.Code-splitting.md)  
[23. 整理](https://github.com/BadmasterY/webpack-book-china/blob/master/23.Tidying-up.md)  
[24. 压缩](https://github.com/BadmasterY/webpack-book-china/blob/master/24.Minifying.md)  
[25. Tree Shaking](https://github.com/BadmasterY/webpack-book-china/blob/master/25.Tree-shaking.md)  
[26. 环境变量](https://github.com/BadmasterY/webpack-book-china/blob/master/26.Environment-variables.md)  
[27. 为文件名添加hash](https://github.com/BadmasterY/webpack-book-china/blob/master/27.Adding-hashes-to-filenames.md)  
[28. 分离清单](https://github.com/BadmasterY/webpack-book-china/blob/master/28.Separating-a-manifest.md)  
[29. 构建分析](https://github.com/BadmasterY/webpack-book-china/blob/master/29.Build-analysis.md)  
[30. 性能](https://github.com/BadmasterY/webpack-book-china/blob/master/30.Performance.md)  
[31. 构建目标(Targets)](https://github.com/BadmasterY/webpack-book-china/blob/master/31.Build-targets.md)  
[32. 多页](https://github.com/BadmasterY/webpack-book-china/blob/master/32.Multiple-pages.md)  
[33. 服务器端渲染(SSR)](https://github.com/BadmasterY/webpack-book-china/blob/master/33.Server-side-rendering.md)  
[34. 动态加载](https://github.com/BadmasterY/webpack-book-china/blob/master/34.Dynamic-loading.md)  
[35. Web Workers](https://github.com/BadmasterY/webpack-book-china/blob/master/35.Web-workers.md)  
[36. 国际化](https://github.com/BadmasterY/webpack-book-china/blob/master/36.Internationalization.md)  
[37. 测试](https://github.com/BadmasterY/webpack-book-china/blob/master/37.Testing.md)  
[38. 部署应用程序](https://github.com/BadmasterY/webpack-book-china/blob/master/38.Deploying-applications.md)  
[39. 使用包(Packages)](https://github.com/BadmasterY/webpack-book-china/blob/master/39.Consuming-packages.md)  
[40. 扩展加载器(loaders)](https://github.com/BadmasterY/webpack-book-china/blob/master/40.Extending-with-loaders.md)  
[41. 扩展插件](https://github.com/BadmasterY/webpack-book-china/blob/master/41.Extending-with-plugins.md)  
[42. 结论](https://github.com/BadmasterY/webpack-book-china/blob/master/42.Conclusion.md)  
